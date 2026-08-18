import {
  EventStatus,
  IndustryTemplate,
  LeadStatus,
  type Prisma,
  type PrismaClient,
} from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import {
  ensureWorkspaceSettings,
  mapAnswersToBanquetEventFields,
} from '../workspace/workspace.service.js';
import type { CreateLeadInput, LeadResponse } from './lead.schema.js';

function splitName(firstName?: string, lastName?: string) {
  return {
    firstName: (firstName ?? 'Customer').trim() || 'Customer',
    lastName: (lastName ?? '').trim() || '-',
  };
}

function isEmptyAnswer(value: string | string[] | undefined): boolean {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.filter((item) => item.trim().length > 0).length === 0;
  return value.trim().length === 0;
}

export class LeadService {
  constructor(private readonly prisma: PrismaClient) {}

  async createLead(input: CreateLeadInput): Promise<LeadResponse> {
    await ensureWorkspaceSettings(this.prisma);

    const settings = await this.prisma.workspaceSettings.findUniqueOrThrow({
      where: { id: 1 },
      include: {
        enquiryForm: {
          include: { questions: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });

    const answers = input.answers ?? {};
    const form = settings.enquiryForm;

    if (form) {
      const errors: string[] = [];
      for (const question of form.questions) {
        if (question.required && isEmptyAnswer(answers[question.id.toString()])) {
          errors.push(`"${question.title}" is required`);
        }
      }
      if (errors.length > 0) {
        throw new AppError('Please complete the enquiry form', 400, errors);
      }
    }

    const banquetFields = form
      ? mapAnswersToBanquetEventFields(
          form.questions.map((question) => ({
            id: question.id.toString(),
            fieldKey: question.fieldKey,
          })),
          answers,
        )
      : null;

    const eventType = input.eventType ?? banquetFields?.eventType ?? null;
    const eventDate =
      input.eventDate ?? banquetFields?.eventDate ?? new Date().toISOString().slice(0, 10);
    const leadSource = input.leadSource ?? banquetFields?.leadSource ?? null;

    const result = await this.prisma.$transaction(async (tx) => {
      let customer;

      if (input.customerId) {
        customer = await tx.customer.findUnique({ where: { id: BigInt(input.customerId) } });
        if (!customer) {
          throw new AppError('Customer not found', 404);
        }
      } else {
        const mobileNo = input.mobileNo!;
        customer = await tx.customer.findFirst({
          where: {
            OR: [{ mobileNo }, { alternateMobileNo: mobileNo }],
          },
        });

        if (!customer) {
          const name = splitName(input.firstName, input.lastName);
          customer = await tx.customer.create({
            data: {
              firstName: name.firstName,
              lastName: name.lastName,
              mobileNo,
            },
          });
        }
      }

      let formResponseId: bigint | null = null;
      const answersJson = answers as Prisma.InputJsonValue;

      if (form && Object.keys(answers).length > 0) {
        const response = await tx.formResponse.create({
          data: {
            formId: form.id,
            answers: answersJson,
          },
        });
        formResponseId = response.id;
      }

      const enquiry = await tx.enquiry.create({
        data: {
          customerId: customer.id,
          enquiryDate: new Date(eventDate),
          leadSource,
          status: LeadStatus.NEW,
          remarks: input.remarks,
          formResponseId,
          answers: Object.keys(answers).length > 0 ? answersJson : undefined,
        },
      });

      // Calendar event only when we have a date-backed industry (banquet) or legacy fields.
      const shouldCreateEvent =
        settings.industryTemplate === IndustryTemplate.BANQUET ||
        Boolean(input.eventType && input.eventDate);

      let eventId: bigint | null = null;
      let eventStatus: EventStatus | 'NEW' = 'NEW';

      if (shouldCreateEvent && (eventType || input.eventType)) {
        const event = await tx.event.create({
          data: {
            enquiryId: enquiry.id,
            customerId: customer.id,
            eventType: eventType ?? input.eventType ?? 'Enquiry',
            eventDate: new Date(eventDate),
            timeSlot: input.timeSlot ?? banquetFields?.timeSlot ?? null,
            guestCount: input.guestCount ?? banquetFields?.guestCount ?? null,
            venue: input.venue ?? banquetFields?.venue ?? null,
            menuPackage: input.menuPackage ?? banquetFields?.menuPackage ?? null,
            approxBudget: input.approxBudget ?? null,
            decorationRequired:
              input.decorationRequired ?? banquetFields?.decorationRequired ?? false,
            specialRequirements:
              input.specialRequirements ?? banquetFields?.specialRequirements ?? null,
            status: EventStatus.TENTATIVE,
          },
        });
        eventId = event.id;
        eventStatus = event.status;
      }

      return {
        customerId: customer.id,
        enquiryId: enquiry.id,
        eventId,
        status: eventStatus,
      };
    });

    return {
      customerId: result.customerId.toString(),
      enquiryId: result.enquiryId.toString(),
      eventId: result.eventId?.toString() ?? null,
      status: result.status,
    };
  }
}

export function assertLeadApiKey(headerValue: string | undefined): void {
  const configuredKey = process.env.LEAD_API_KEY?.trim();

  if (!configuredKey) {
    return;
  }

  if (!headerValue || headerValue !== configuredKey) {
    throw new AppError('Invalid lead API key', 401);
  }
}
