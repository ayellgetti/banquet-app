import { EventStatus, type LeadStatus, type PrismaClient } from '@prisma/client';
import { isUnconvertibleLeadStatus } from './lead-status.js';

/** Drop a hold on the hall when a lead is closed without a booking. */
export async function cancelTentativeEventForClosedLead(
  prisma: PrismaClient,
  enquiryId: bigint,
  status: LeadStatus,
) {
  if (!isUnconvertibleLeadStatus(status)) return;

  await prisma.event.updateMany({
    where: {
      enquiryId,
      status: EventStatus.TENTATIVE,
    },
    data: { status: EventStatus.CANCELLED },
  });
}
