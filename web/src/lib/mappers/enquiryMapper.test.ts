import { describe, expect, it } from "vitest";
import {
  formatCustomerName,
  mapEnquiryLeadPayloadToCrm,
  normalizeMobileNo,
  splitCustomerName,
} from "@/lib/mappers/enquiryMapper";
import { mapLeadStatusToFrontend, mapFrontendStatusToBackend } from "@/lib/mappers/statusMapper";

describe("enquiryMapper", () => {
  it("splits customer names", () => {
    expect(splitCustomerName("Rahul Sharma")).toEqual({
      firstName: "Rahul",
      lastName: "Sharma",
    });
    expect(splitCustomerName("Madonna")).toEqual({
      firstName: "Madonna",
      lastName: ".",
    });
  });

  it("formats customer names for display", () => {
    expect(formatCustomerName("Rahul", "Sharma")).toBe("Rahul Sharma");
    expect(formatCustomerName("Madonna", ".")).toBe("Madonna");
    expect(formatCustomerName("Ravina", "Kohe")).toBe("Ravina Kohe");
  });

  it("normalizes mobile numbers", () => {
    expect(normalizeMobileNo("+91 98765 01234")).toBe("9876501234");
  });

  it("maps lead payload to CRM payload", () => {
    const mapped = mapEnquiryLeadPayloadToCrm({
      name: "Rahul Sharma",
      mobileNo: "9876501234",
      eventDate: "2026-09-15",
      eventSlot: "Evening 04:00 PM – 10:00 PM",
      eventMenuRange: "Gold (₹1200/plate)",
      eventNumberOfGuest: "150",
      eventType: "Wedding",
      eventAdditionDetail: "Venue: Grand Hall\nSource: Website\nApprox budget: 2Lac - 3Lac\nModule: Enquiry v2",
    });

    expect(mapped.firstName).toBe("Rahul");
    expect(mapped.lastName).toBe("Sharma");
    expect(mapped.timeSlot).toBe("EVENING");
    expect(mapped.guestCount).toBe(150);
    expect(mapped.leadSource).toBe("Website");
    expect(mapped.approxBudget).toBe(250000);
  });
});

describe("statusMapper", () => {
  it("maps backend statuses to frontend statuses", () => {
    expect(mapLeadStatusToFrontend("NEW")).toBe("new");
    expect(mapLeadStatusToFrontend("CONTACTED")).toBe("contacted");
    expect(mapLeadStatusToFrontend("QUALIFIED")).toBe("qualified");
    expect(mapLeadStatusToFrontend("FOLLOW_UP")).toBe("visit_scheduled");
    expect(mapLeadStatusToFrontend("QUOTATION_SENT")).toBe("quotation_sent");
    expect(mapLeadStatusToFrontend("NEGOTIATION")).toBe("negotiation");
    expect(mapLeadStatusToFrontend("CONVERTED")).toBe("booked");
    expect(mapLeadStatusToFrontend("FAKE")).toBe("fake");
    expect(mapLeadStatusToFrontend("NOT_INTERESTED")).toBe("not_interested");
    expect(mapLeadStatusToFrontend("OTHER")).toBe("other");
    expect(mapLeadStatusToFrontend("LOST")).toBe("not_interested");
  });

  it("maps frontend statuses to backend statuses", () => {
    expect(mapFrontendStatusToBackend("new")).toBe("NEW");
    expect(mapFrontendStatusToBackend("qualified")).toBe("QUALIFIED");
    expect(mapFrontendStatusToBackend("visit_scheduled")).toBe("FOLLOW_UP");
    expect(mapFrontendStatusToBackend("quotation_sent")).toBe("QUOTATION_SENT");
    expect(mapFrontendStatusToBackend("negotiation")).toBe("NEGOTIATION");
    expect(mapFrontendStatusToBackend("booked")).toBe("CONVERTED");
    expect(mapFrontendStatusToBackend("fake")).toBe("FAKE");
    expect(mapFrontendStatusToBackend("not_interested")).toBe("NOT_INTERESTED");
    expect(mapFrontendStatusToBackend("other")).toBe("OTHER");
  });
});
