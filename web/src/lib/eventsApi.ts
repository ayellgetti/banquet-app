import type { CalendarEvent, EventCategory } from "@/data/banquetData";
import { apiRequest } from "@/lib/apiClient";
import { formatCustomerName } from "@/lib/mappers/enquiryMapper";
import type { BackendLeadStatus } from "@/lib/mappers/statusMapper";
import { format, endOfMonth, startOfMonth } from "date-fns";

const LOST_LEAD_STATUSES: BackendLeadStatus[] = ["LOST", "FAKE", "NOT_INTERESTED", "OTHER"];

export type EventDetailRecord = {
  id: string;
  enquiryId: string;
  customerId: string;
  eventType: string;
  eventDate: string;
  timeSlot: "MORNING" | "EVENING" | "FULL_DAY" | null;
  guestCount: number | null;
  venue: string | null;
  menuPackage: string | null;
  platePackageId: string | null;
  menuItemIds: string[];
  menuSavedAt: string | null;
  approxBudget: string | null;
  decorationRequired: boolean;
  specialRequirements: string | null;
  status: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    mobileNo: string;
  };
};

export type SaveMenuSelectionInput = {
  platePackageId: string;
  menuItemIds: string[];
  menuPackage?: string | null;
  guestCount?: number | null;
};

type ApiCalendarEvent = {
  id: string;
  enquiryId: string;
  eventType: string;
  eventDate: string;
  timeSlot: "MORNING" | "EVENING" | "FULL_DAY" | null;
  status: "TENTATIVE" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  enquiryStatus: BackendLeadStatus | null;
  venue: string | null;
  guestCount: number | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    mobileNo: string;
  };
};

function isLostLead(status: ApiCalendarEvent["enquiryStatus"]): boolean {
  return status !== null && LOST_LEAD_STATUSES.includes(status);
}

function timeSlotToTime(slot: ApiCalendarEvent["timeSlot"]): { time: string; endTime?: string } {
  switch (slot) {
    case "MORNING":
      return { time: "08:00", endTime: "14:00" };
    case "EVENING":
      return { time: "16:00", endTime: "22:00" };
    case "FULL_DAY":
      return { time: "08:00", endTime: "22:00" };
    default:
      return { time: "12:00" };
  }
}

function inferCategory(eventType: string): EventCategory {
  const lower = eventType.toLowerCase();
  if (lower.includes("wedding") || lower.includes("reception")) return "wedding";
  if (lower.includes("corporate") || lower.includes("conference")) return "corporate";
  return "private";
}

function mapCalendarStatus(event: ApiCalendarEvent): CalendarEvent["status"] {
  if (isLostLead(event.enquiryStatus)) return "lost";
  if (event.status === "CONFIRMED" || event.status === "COMPLETED") return "confirmed";
  if (event.status === "TENTATIVE") return "tentative";
  return "enquiry";
}

function mapToCalendarEvent(event: ApiCalendarEvent): CalendarEvent {
  const { time, endTime } = timeSlotToTime(event.timeSlot);
  const client = formatCustomerName(event.customer.firstName, event.customer.lastName);
  const status = mapCalendarStatus(event);

  return {
    id: event.id,
    title: event.eventType,
    date: event.eventDate,
    time,
    endTime,
    venue: event.venue ?? undefined,
    category: inferCategory(event.eventType),
    status,
    kind: status === "confirmed" ? "booking" : "enquiry",
    client,
    customerId: event.customer.id,
    guests: event.guestCount ?? undefined,
    logId: event.enquiryId,
  };
}

export async function fetchCalendarEventsFromApi(month = new Date()): Promise<CalendarEvent[]> {
  const from = format(startOfMonth(month), "yyyy-MM-dd");
  const to = format(endOfMonth(month), "yyyy-MM-dd");
  const events = await apiRequest<ApiCalendarEvent[]>(
    `/events/calendar?from=${from}&to=${to}`,
  );
  return (events ?? [])
    .filter((event) => event.status !== "CANCELLED" || isLostLead(event.enquiryStatus))
    .map(mapToCalendarEvent)
    .sort(
    (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
  );
}

export async function fetchAllCalendarEventsFromApi(): Promise<CalendarEvent[]> {
  const now = new Date();
  const from = format(new Date(now.getFullYear(), now.getMonth() - 1, 1), "yyyy-MM-dd");
  const to = format(new Date(now.getFullYear(), now.getMonth() + 6, 0), "yyyy-MM-dd");
  const events = await apiRequest<ApiCalendarEvent[]>(
    `/events/calendar?from=${from}&to=${to}`,
  );
  return (events ?? [])
    .filter((event) => event.status !== "CANCELLED" || isLostLead(event.enquiryStatus))
    .map(mapToCalendarEvent);
}

export async function fetchEventByIdFromApi(eventId: string): Promise<EventDetailRecord> {
  return apiRequest<EventDetailRecord>(`/events/${eventId}`);
}

export async function saveMenuSelectionViaApi(
  eventId: string,
  input: SaveMenuSelectionInput,
): Promise<EventDetailRecord> {
  return apiRequest<EventDetailRecord>(`/events/${eventId}/menu-selection`, {
    method: "PUT",
    body: input,
  });
}
