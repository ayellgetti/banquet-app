import { IndustryTemplate } from '@prisma/client';
import { z } from 'zod';

export const updateWorkspaceSchema = z
  .object({
    industryTemplate: z.nativeEnum(IndustryTemplate).optional(),
    enquiryFormId: z.union([z.string().regex(/^\d+$/), z.null()]).optional(),
  })
  .refine((data) => data.industryTemplate !== undefined || data.enquiryFormId !== undefined, {
    message: 'At least one field must be provided',
  });

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

export function parseEnquiryFormId(value: string | null | undefined): bigint | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return BigInt(value);
}
