import { FormQuestionType } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/pagination.js';

const optionalText = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    if (value === undefined) return undefined;
    const trimmed = value?.trim() ?? '';
    return trimmed.length === 0 ? null : trimmed;
  });

export const CHOICE_QUESTION_TYPES: FormQuestionType[] = [
  FormQuestionType.MULTIPLE_CHOICE,
  FormQuestionType.CHECKBOXES,
  FormQuestionType.DROPDOWN,
];

export function isChoiceQuestionType(type: FormQuestionType): boolean {
  return CHOICE_QUESTION_TYPES.includes(type);
}

export const listFormsQuerySchema = paginationQuerySchema;

export const createFormSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: optionalText,
});

const questionInputSchema = z.object({
  id: z.string().regex(/^\d+$/).optional(),
  type: z.nativeEnum(FormQuestionType),
  title: z.string().trim().min(1).max(500),
  description: optionalText,
  required: z.boolean().optional().default(false),
  options: z.array(z.string().trim().max(255)).optional().default([]),
  fieldKey: z.string().trim().max(64).optional().nullable(),
});

export const updateFormSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: optionalText,
    published: z.boolean().optional(),
    questions: z.array(questionInputSchema).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const submitFormSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export const slugParamSchema = z.object({
  slug: z.string().min(4).max(32),
});

export type ListFormsQuery = z.infer<typeof listFormsQuerySchema>;
export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type QuestionInput = z.infer<typeof questionInputSchema>;
export type SubmitFormInput = z.infer<typeof submitFormSchema>;
