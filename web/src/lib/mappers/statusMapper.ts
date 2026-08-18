import type { EnquiryStatus } from "@/data/banquetData";

export type BackendLeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "FOLLOW_UP"
  | "QUOTATION_SENT"
  | "NEGOTIATION"
  | "CONVERTED"
  | "LOST"
  | "FAKE"
  | "NOT_INTERESTED"
  | "OTHER";

export function mapLeadStatusToFrontend(status: BackendLeadStatus): EnquiryStatus {
  switch (status) {
    case "NEW":
      return "new";
    case "CONTACTED":
      return "contacted";
    case "QUALIFIED":
      return "qualified";
    case "FOLLOW_UP":
      return "visit_scheduled";
    case "QUOTATION_SENT":
      return "quotation_sent";
    case "NEGOTIATION":
      return "negotiation";
    case "CONVERTED":
      return "booked";
    case "FAKE":
      return "fake";
    case "NOT_INTERESTED":
    case "LOST":
      return "not_interested";
    case "OTHER":
      return "other";
    default:
      return "new";
  }
}

export function mapFrontendStatusToBackend(status: EnquiryStatus): BackendLeadStatus {
  switch (status) {
    case "new":
      return "NEW";
    case "contacted":
      return "CONTACTED";
    case "qualified":
      return "QUALIFIED";
    case "visit_scheduled":
      return "FOLLOW_UP";
    case "quotation_sent":
      return "QUOTATION_SENT";
    case "negotiation":
      return "NEGOTIATION";
    case "booked":
      return "CONVERTED";
    case "fake":
      return "FAKE";
    case "not_interested":
    case "lost":
      return "NOT_INTERESTED";
    case "other":
      return "OTHER";
    default:
      return "NEW";
  }
}
