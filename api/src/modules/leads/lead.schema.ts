import { EventStatus, TimeSlot } from '@prisma/client';
import { z } from 'zod';
import { optionalNullableString } from '../../shared/zod.js';
import { isValidIndianMobile, normalizeMobile } from '../../utils/mobile.js';

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const mobileSchema = z
  .string()
  .min(1, 'Mobile number is required')
  .transform(normalizeMobile)
  .refine(isValidIndianMobile, 'Mobile number must be a valid 10-digit Indian number');

const answerValueSchema = z.union([z.string(), z.array(z.string())]);

/** Legacy banquet fields remain optional when answers are provided via the enquiry form. */
export const createLeadSchema = z
  .object({
    customerId: z.string().regex(/^\d+$/).optional(),
    firstName: z.string().min(1).max(150).optional(),
    lastName: z.string().min(1).max(150).optional(),
    mobileNo: mobileSchema.optional(),
    eventType: z.string().min(1).max(100).optional(),
    eventDate: dateStringSchema.optional(),
    timeSlot: z.nativeEnum(TimeSlot).optional().nullable(),
    guestCount: z.coerce.number().int().positive().optional().nullable(),
    venue: optionalNullableString(255),
    menuPackage: optionalNullableString(255),
    leadSource: optionalNullableString(100),
    approxBudget: z.coerce.number().nonnegative().optional().nullable(),
    decorationRequired: z.boolean().optional(),
    specialRequirements: z.string().optional().nullable().transform((value) => value ?? null),
    remarks: z.string().optional().nullable().transform((value) => value ?? null),
    answers: z.record(z.string(), answerValueSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.customerId) {
      if (!data.firstName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'firstName is required', path: ['firstName'] });
      }
      if (!data.lastName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'lastName is required', path: ['lastName'] });
      }
      if (!data.mobileNo) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'mobileNo is required', path: ['mobileNo'] });
      }
    }
  });

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export interface LeadResponse {
  customerId: string;
  enquiryId: string;
  eventId: string | null;
  status: EventStatus | 'NEW';
}
