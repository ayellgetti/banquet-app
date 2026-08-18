import { LeadStatus } from '@prisma/client';

export const OPEN_LEAD_STATUSES: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.QUALIFIED,
  LeadStatus.FOLLOW_UP,
  LeadStatus.QUOTATION_SENT,
  LeadStatus.NEGOTIATION,
];

export const UNCONVERTIBLE_LEAD_STATUSES: LeadStatus[] = [
  LeadStatus.LOST,
  LeadStatus.FAKE,
  LeadStatus.NOT_INTERESTED,
  LeadStatus.OTHER,
];

export function isUnconvertibleLeadStatus(status: LeadStatus): boolean {
  return UNCONVERTIBLE_LEAD_STATUSES.includes(status);
}
