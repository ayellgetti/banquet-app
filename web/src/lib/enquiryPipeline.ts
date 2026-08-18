import type { EnquiryStatus } from "@/data/banquetData";

export const LEAD_PIPELINE_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "visit_scheduled",
  "quotation_sent",
  "negotiation",
  "booked",
] as const satisfies readonly EnquiryStatus[];

export type LeadPipelineStatus = (typeof LEAD_PIPELINE_STATUSES)[number];

export const OPEN_PIPELINE_STATUSES = LEAD_PIPELINE_STATUSES.filter(
  (status): status is Exclude<LeadPipelineStatus, "booked"> => status !== "booked",
);

export const LEAD_OUTCOME_STATUSES = [
  "booked",
  "fake",
  "not_interested",
  "other",
] as const satisfies readonly EnquiryStatus[];

export type LeadOutcomeStatus = (typeof LEAD_OUTCOME_STATUSES)[number];

export const FOLLOW_UP_BOARD_STATUSES = [
  ...OPEN_PIPELINE_STATUSES,
  ...LEAD_OUTCOME_STATUSES,
] as const;

export type FollowUpBoardStatus = (typeof FOLLOW_UP_BOARD_STATUSES)[number];

export const ENQUIRY_STATUS_CLASS: Record<EnquiryStatus, string> = {
  new: "border-sky-500/25 bg-sky-500/10 text-sky-800 dark:text-sky-200",
  contacted: "border-violet-500/25 bg-violet-500/10 text-violet-800 dark:text-violet-200",
  qualified: "border-teal-500/25 bg-teal-500/10 text-teal-800 dark:text-teal-200",
  visit_scheduled: "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  quotation_sent: "border-orange-500/25 bg-orange-500/10 text-orange-800 dark:text-orange-200",
  negotiation: "border-rose-500/25 bg-rose-500/10 text-rose-800 dark:text-rose-200",
  booked: "border-primary/25 bg-primary/10 text-primary",
  fake: "border-stone-500/25 bg-stone-500/10 text-stone-800 dark:text-stone-200",
  not_interested: "border-destructive/25 bg-destructive/10 text-destructive",
  other: "border-slate-500/25 bg-slate-500/10 text-slate-800 dark:text-slate-200",
  lost: "border-destructive/25 bg-destructive/10 text-destructive",
};

export const PIPELINE_COLUMN_ACCENT: Record<FollowUpBoardStatus, string> = {
  new: "bg-sky-500",
  contacted: "bg-violet-500",
  qualified: "bg-teal-500",
  visit_scheduled: "bg-amber-500",
  quotation_sent: "bg-orange-500",
  negotiation: "bg-rose-500",
  booked: "bg-primary",
  fake: "bg-stone-500",
  not_interested: "bg-destructive",
  other: "bg-slate-500",
};

export function isLeadOutcomeStatus(status: EnquiryStatus): status is LeadOutcomeStatus {
  return (LEAD_OUTCOME_STATUSES as readonly string[]).includes(status) || status === "lost";
}

/** Terminal outcomes that close a lead without converting to a booking. */
export function isClosingOutcomeStatus(status: EnquiryStatus): boolean {
  return isLeadOutcomeStatus(status) && status !== "booked";
}

export function selectableEnquiryStatus(status: EnquiryStatus): EnquiryStatus {
  return status === "lost" ? "not_interested" : status;
}

export function isClosedEnquiryStatus(status: EnquiryStatus): boolean {
  return isLeadOutcomeStatus(status);
}

export function isOpenEnquiryStatus(status: EnquiryStatus): boolean {
  return !isClosedEnquiryStatus(status);
}

export function isLeadPipelineStatus(status: EnquiryStatus): status is LeadPipelineStatus {
  return (LEAD_PIPELINE_STATUSES as readonly string[]).includes(status);
}

export function pipelineIndex(status: EnquiryStatus): number {
  const index = LEAD_PIPELINE_STATUSES.indexOf(status as LeadPipelineStatus);
  return index < 0 ? -1 : index;
}

export function boardStatusFor(status: EnquiryStatus): FollowUpBoardStatus | null {
  if (status === "lost") return "not_interested";
  if ((FOLLOW_UP_BOARD_STATUSES as readonly string[]).includes(status)) {
    return status as FollowUpBoardStatus;
  }
  return null;
}
