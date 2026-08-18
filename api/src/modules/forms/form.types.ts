import type { FormQuestionType } from '@prisma/client';
import type { PaginationMeta } from '../../shared/pagination.js';

export interface FormQuestionResponse {
  id: string;
  sortOrder: number;
  type: FormQuestionType;
  title: string;
  description: string | null;
  required: boolean;
  options: string[];
  fieldKey: string | null;
}

export interface FormListItemResponse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  published: boolean;
  questionCount: number;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormDetailResponse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  published: boolean;
  questions: FormQuestionResponse[];
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormPublicResponse {
  slug: string;
  title: string;
  description: string | null;
  questions: FormQuestionResponse[];
}

export interface FormResponseItem {
  id: string;
  answers: Record<string, string | string[]>;
  submittedAt: string;
}

export interface FormResponsesResult {
  items: FormResponseItem[];
  meta: PaginationMeta;
}

export interface SubmitFormResult {
  id: string;
  submittedAt: string;
}
