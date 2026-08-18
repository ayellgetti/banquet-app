import {
  FormPurpose,
  FormQuestionType,
  IndustryTemplate,
  TimeSlot,
  type Prisma,
  type PrismaClient,
} from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { AppError } from '../../shared/errors/app-error.js';
import {
  getIndustryTemplate,
  INDUSTRY_TEMPLATES,
  type IndustryTemplateDef,
  type PipelineStageDef,
} from './industry-templates.js';

export type WorkspaceSettingsResponse = {
  industryTemplate: IndustryTemplate;
  industryLabel: string;
  industryDescription: string;
  enquiryFormId: string | null;
  enquiryForm: {
    id: string;
    title: string;
    description: string | null;
    published: boolean;
    questions: Array<{
      id: string;
      sortOrder: number;
      type: FormQuestionType;
      title: string;
      description: string | null;
      required: boolean;
      options: string[];
      fieldKey: string | null;
    }>;
  } | null;
  followUpStages: PipelineStageDef[];
  postConfirmStages: PipelineStageDef[];
  availableTemplates: Array<{
    key: IndustryTemplate;
    label: string;
    description: string;
  }>;
};

function createSlug() {
  return randomBytes(6).toString('base64url');
}

async function uniqueSlug(prisma: PrismaClient) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const slug = createSlug();
    const existing = await prisma.form.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  throw new AppError('Could not allocate form slug', 500);
}

async function ensureAdminUserId(prisma: PrismaClient): Promise<bigint> {
  const admin = await prisma.user.findFirst({
    orderBy: { id: 'asc' },
    select: { id: true },
  });
  if (!admin) {
    throw new AppError('No users found — create an admin before seeding workspace forms', 500);
  }
  return admin.id;
}

async function upsertTemplateForm(
  prisma: PrismaClient,
  createdById: bigint,
  template: IndustryTemplateDef,
) {
  const existing = await prisma.form.findUnique({
    where: { templateKey: template.enquiryForm.templateKey },
    include: { questions: true },
  });

  if (existing) {
    return existing;
  }

  return prisma.form.create({
    data: {
      slug: await uniqueSlug(prisma),
      title: template.enquiryForm.title,
      description: template.enquiryForm.description,
      published: true,
      purpose: FormPurpose.ENQUIRY,
      templateKey: template.enquiryForm.templateKey,
      createdById,
      questions: {
        create: template.enquiryForm.questions.map((question, index) => ({
          sortOrder: index,
          type: question.type,
          title: question.title,
          description: question.description ?? null,
          required: question.required,
          options: question.options ?? [],
          fieldKey: question.fieldKey,
        })),
      },
    },
    include: { questions: true },
  });
}

export async function ensureWorkspaceSettings(prisma: PrismaClient) {
  const createdById = await ensureAdminUserId(prisma);

  for (const template of Object.values(INDUSTRY_TEMPLATES)) {
    await upsertTemplateForm(prisma, createdById, template);
  }

  const existing = await prisma.workspaceSettings.findUnique({ where: { id: 1 } });
  if (existing) {
    return existing;
  }

  const banquet = getIndustryTemplate(IndustryTemplate.BANQUET);
  const form = await prisma.form.findUniqueOrThrow({
    where: { templateKey: banquet.enquiryForm.templateKey },
  });

  return prisma.workspaceSettings.create({
    data: {
      id: 1,
      industryTemplate: IndustryTemplate.BANQUET,
      enquiryFormId: form.id,
      followUpStages: banquet.followUpStages as unknown as Prisma.InputJsonValue,
      postConfirmStages: banquet.postConfirmStages as unknown as Prisma.InputJsonValue,
    },
  });
}

function asStages(value: Prisma.JsonValue): PipelineStageDef[] {
  if (!Array.isArray(value)) return [];
  return value as unknown as PipelineStageDef[];
}

export class WorkspaceService {
  constructor(private readonly prisma: PrismaClient) {}

  async getSettings(): Promise<WorkspaceSettingsResponse> {
    await ensureWorkspaceSettings(this.prisma);

    const settings = await this.prisma.workspaceSettings.findUniqueOrThrow({
      where: { id: 1 },
      include: {
        enquiryForm: {
          include: {
            questions: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    const template = getIndustryTemplate(settings.industryTemplate);

    return {
      industryTemplate: settings.industryTemplate,
      industryLabel: template.label,
      industryDescription: template.description,
      enquiryFormId: settings.enquiryFormId?.toString() ?? null,
      enquiryForm: settings.enquiryForm
        ? {
            id: settings.enquiryForm.id.toString(),
            title: settings.enquiryForm.title,
            description: settings.enquiryForm.description,
            published: settings.enquiryForm.published,
            questions: settings.enquiryForm.questions.map((question) => ({
              id: question.id.toString(),
              sortOrder: question.sortOrder,
              type: question.type,
              title: question.title,
              description: question.description,
              required: question.required,
              options: question.options,
              fieldKey: question.fieldKey,
            })),
          }
        : null,
      followUpStages: asStages(settings.followUpStages),
      postConfirmStages: asStages(settings.postConfirmStages),
      availableTemplates: Object.values(INDUSTRY_TEMPLATES).map((item) => ({
        key: item.key,
        label: item.label,
        description: item.description,
      })),
    };
  }

  async updateIndustry(industryTemplate: IndustryTemplate): Promise<WorkspaceSettingsResponse> {
    await ensureWorkspaceSettings(this.prisma);
    const template = getIndustryTemplate(industryTemplate);

    const form = await this.prisma.form.findUniqueOrThrow({
      where: { templateKey: template.enquiryForm.templateKey },
    });

    await this.prisma.workspaceSettings.update({
      where: { id: 1 },
      data: {
        industryTemplate,
        enquiryFormId: form.id,
        followUpStages: template.followUpStages as unknown as Prisma.InputJsonValue,
        postConfirmStages: template.postConfirmStages as unknown as Prisma.InputJsonValue,
      },
    });

    return this.getSettings();
  }

  async setEnquiryForm(formId: bigint | null): Promise<WorkspaceSettingsResponse> {
    await ensureWorkspaceSettings(this.prisma);

    if (formId !== null) {
      const form = await this.prisma.form.findUnique({ where: { id: formId } });
      if (!form) throw new AppError('Form not found', 404);
      if (!form.published) throw new AppError('Enquiry form must be published', 400);
    }

    await this.prisma.workspaceSettings.update({
      where: { id: 1 },
      data: { enquiryFormId: formId },
    });

    return this.getSettings();
  }
}

/** Map banquet field keys from form answers into Event create fields. */
export function mapAnswersToBanquetEventFields(
  questions: Array<{ id: string; fieldKey: string | null }>,
  answers: Record<string, string | string[]>,
) {
  const byKey = new Map<string, string | string[]>();
  for (const question of questions) {
    if (!question.fieldKey) continue;
    const value = answers[question.id];
    if (value !== undefined) byKey.set(question.fieldKey, value);
  }

  const asString = (key: string) => {
    const value = byKey.get(key);
    if (value === undefined) return null;
    return Array.isArray(value) ? value.join(', ') : value.trim() || null;
  };

  const timeSlotRaw = (asString('time_slot') ?? '').toLowerCase();
  let timeSlot: TimeSlot | null = null;
  if (timeSlotRaw.includes('full')) timeSlot = TimeSlot.FULL_DAY;
  else if (timeSlotRaw.includes('morning')) timeSlot = TimeSlot.MORNING;
  else if (timeSlotRaw.includes('evening')) timeSlot = TimeSlot.EVENING;

  const guestRaw = asString('guest_count');
  const guestCount = guestRaw ? Number.parseInt(guestRaw.replace(/\D/g, ''), 10) : null;

  const decoration = (asString('decoration_required') ?? '').toLowerCase();
  const eventDate = asString('event_date');
  const eventType = asString('event_type') ?? 'Enquiry';

  return {
    eventType,
    eventDate,
    timeSlot,
    guestCount: Number.isFinite(guestCount) && guestCount && guestCount > 0 ? guestCount : null,
    venue: asString('venue'),
    menuPackage: asString('menu_package'),
    leadSource: asString('lead_source'),
    approxBudget: null as number | null,
    decorationRequired: decoration === 'yes' || decoration.includes('yes'),
    specialRequirements: asString('special_requirements'),
  };
}
