import type { FormQuestion, Prisma } from '@prisma/client';
import type {
  FormDetailResponse,
  FormListItemResponse,
  FormPublicResponse,
  FormQuestionResponse,
  FormResponseItem,
} from './form.types.js';
import type { FormWithQuestions } from './form.repository.js';
import type { FormResponse } from '@prisma/client';

export function toQuestionResponse(question: FormQuestion): FormQuestionResponse {
  return {
    id: question.id.toString(),
    sortOrder: question.sortOrder,
    type: question.type,
    title: question.title,
    description: question.description,
    required: question.required,
    options: question.options,
    fieldKey: question.fieldKey,
  };
}

export function toFormListItem(form: FormWithQuestions): FormListItemResponse {
  return {
    id: form.id.toString(),
    slug: form.slug,
    title: form.title,
    description: form.description,
    published: form.published,
    questionCount: form._count.questions,
    responseCount: form._count.responses,
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
  };
}

export function toFormDetail(form: FormWithQuestions): FormDetailResponse {
  return {
    id: form.id.toString(),
    slug: form.slug,
    title: form.title,
    description: form.description,
    published: form.published,
    questions: form.questions.map(toQuestionResponse),
    responseCount: form._count.responses,
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
  };
}

export function toPublicForm(form: FormWithQuestions): FormPublicResponse {
  return {
    slug: form.slug,
    title: form.title,
    description: form.description,
    questions: form.questions.map(toQuestionResponse),
  };
}

export function toResponseItem(response: FormResponse): FormResponseItem {
  return {
    id: response.id.toString(),
    answers: (response.answers ?? {}) as Record<string, string | string[]>,
    submittedAt: response.submittedAt.toISOString(),
  };
}

export function toJsonAnswers(
  answers: Record<string, string | string[]>,
): Prisma.InputJsonValue {
  return answers;
}
