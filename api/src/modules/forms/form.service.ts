import { randomBytes } from 'node:crypto';
import { FormQuestionType, type PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { FormRepository, type FormWithQuestions } from './form.repository.js';
import {
  toFormDetail,
  toFormListItem,
  toJsonAnswers,
  toPublicForm,
  toResponseItem,
} from './form.mapper.js';
import { isChoiceQuestionType } from './form.schema.js';
import type {
  CreateFormInput,
  ListFormsQuery,
  QuestionInput,
  SubmitFormInput,
  UpdateFormInput,
} from './form.schema.js';
import type {
  FormDetailResponse,
  FormListItemResponse,
  FormPublicResponse,
  FormResponsesResult,
  SubmitFormResult,
} from './form.types.js';

function createSlug() {
  return randomBytes(6).toString('base64url');
}

function isEmptyAnswer(value: string | string[] | undefined): boolean {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.filter((item) => item.trim().length > 0).length === 0;
  return value.trim().length === 0;
}

export class FormService {
  constructor(
    private readonly repository: FormRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async list(query: ListFormsQuery): Promise<PaginatedResult<FormListItemResponse>> {
    const [forms, total] = await this.repository.findAll(query);
    return {
      items: forms.map(toFormListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(id: bigint): Promise<FormDetailResponse> {
    const form = await this.requireForm(id);
    return toFormDetail(form);
  }

  async getPublicBySlug(slug: string): Promise<FormPublicResponse> {
    const form = await this.repository.findBySlug(slug);
    if (!form || !form.published) {
      throw new AppError('Form not found', 404);
    }
    return toPublicForm(form);
  }

  async create(userId: bigint, input: CreateFormInput): Promise<FormDetailResponse> {
    const form = await this.repository.create({
      slug: await this.uniqueSlug(),
      title: input.title?.trim() || 'Untitled form',
      description: input.description ?? null,
      createdBy: { connect: { id: userId } },
      questions: {
        create: [
          {
            sortOrder: 0,
            type: FormQuestionType.SHORT_ANSWER,
            title: 'Untitled question',
            required: false,
            options: [],
          },
        ],
      },
    });

    return toFormDetail(form);
  }

  async update(id: bigint, input: UpdateFormInput): Promise<FormDetailResponse> {
    const existing = await this.requireForm(id);

    if (input.questions) {
      await this.syncQuestions(existing.id, input.questions);
    }

    const form = await this.repository.update(id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.published !== undefined && { published: input.published }),
    });

    return toFormDetail(form);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    await this.requireForm(id);
    await this.repository.delete(id);
    return { message: 'Form deleted' };
  }

  async listResponses(id: bigint, query: ListFormsQuery): Promise<FormResponsesResult> {
    await this.requireForm(id);
    const [items, total] = await this.repository.listResponses(id, query.page, query.limit);
    return {
      items: items.map(toResponseItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async submit(slug: string, input: SubmitFormInput): Promise<SubmitFormResult> {
    const form = await this.repository.findBySlug(slug);
    if (!form || !form.published) {
      throw new AppError('Form not found', 404);
    }

    const errors: string[] = [];
    const sanitized: Record<string, string | string[]> = {};

    for (const question of form.questions) {
      const raw = input.answers[question.id.toString()];
      if (question.required && isEmptyAnswer(raw)) {
        errors.push(`"${question.title}" is required`);
        continue;
      }

      if (isEmptyAnswer(raw)) continue;

      if (question.type === FormQuestionType.CHECKBOXES) {
        const values = Array.isArray(raw) ? raw : [raw];
        const allowed = new Set(question.options);
        sanitized[question.id.toString()] = values.filter((value) => allowed.has(value));
        continue;
      }

      const value = Array.isArray(raw) ? raw[0] ?? '' : raw;
      if (
        isChoiceQuestionType(question.type) &&
        question.options.length > 0 &&
        !question.options.includes(value)
      ) {
        errors.push(`Invalid option for "${question.title}"`);
        continue;
      }

      sanitized[question.id.toString()] = value;
    }

    if (errors.length > 0) {
      throw new AppError('Please fix the highlighted questions', 400, errors);
    }

    const response = await this.repository.createResponse({
      formId: form.id,
      answers: toJsonAnswers(sanitized),
    });

    return {
      id: response.id.toString(),
      submittedAt: response.submittedAt.toISOString(),
    };
  }

  private async requireForm(id: bigint): Promise<FormWithQuestions> {
    const form = await this.repository.findById(id);
    if (!form) {
      throw new AppError('Form not found', 404);
    }
    return form;
  }

  private async uniqueSlug(): Promise<string> {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const slug = createSlug();
      const existing = await this.repository.findBySlug(slug);
      if (!existing) return slug;
    }
    throw new AppError('Could not create a unique form link', 500);
  }

  private async syncQuestions(formId: bigint, questions: QuestionInput[]) {
    const keepIds: bigint[] = [];

    for (const [index, question] of questions.entries()) {
      const options = isChoiceQuestionType(question.type)
        ? question.options.map((option) => option.trim()).filter(Boolean)
        : [];

      const data = {
        sortOrder: index,
        type: question.type,
        title: question.title,
        description: question.description ?? null,
        required: question.required,
        options,
        fieldKey: question.fieldKey ?? null,
      };

      if (question.id) {
        const id = BigInt(question.id);
        const existing = await this.prisma.formQuestion.findFirst({
          where: { id, formId },
        });
        if (!existing) {
          throw new AppError('Question not found', 404);
        }
        await this.repository.updateQuestion(id, data);
        keepIds.push(id);
        continue;
      }

      const created = await this.repository.createQuestion({
        formId,
        ...data,
      });
      keepIds.push(created.id);
    }

    await this.repository.deleteQuestions(formId, keepIds);
  }
}
