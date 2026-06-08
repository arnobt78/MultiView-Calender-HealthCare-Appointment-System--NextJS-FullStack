import { describe, it, expect } from "vitest";
import {
  buildBookingVisitFeeInfoNote,
  buildInvoiceVisitFeeStripLine,
  buildServicesVisitFeePolicyNote,
  resolveBookingVisitFeeDisplay,
  resolveDisplayedVisitFeeCents,
} from "@/lib/appointment-visit-fee-display";
import { DEFAULT_DOCTOR_VISIT_FEE_CENTS } from "@/lib/billing-visit-fee";

describe("buildBookingVisitFeeInfoNote", () => {
  it("mentions type fee when type has price", () => {
    const note = buildBookingVisitFeeInfoNote({ selectedTypePriceCents: 9250 });
    expect(note).toContain("92.50");
    expect(note).not.toContain("€150.00");
  });

  it("mentions doctor consultation fee when type has no price", () => {
    const note = buildBookingVisitFeeInfoNote({
      doctorConsultationFeeCents: 20000,
      selectedTypePriceCents: 0,
    });
    expect(note).toContain("200.00");
    expect(note).toContain("· est.");
  });

  it("mentions clinic default when no type or doctor fee", () => {
    const note = buildBookingVisitFeeInfoNote({
      doctorConsultationFeeCents: 0,
      selectedTypePriceCents: 0,
    });
    expect(note).toContain("150.00");
  });
});

describe("buildServicesVisitFeePolicyNote", () => {
  it("explains tiered fees and clinic default", () => {
    const note = buildServicesVisitFeePolicyNote();
    expect(note).toContain("consultation fee");
    expect(note).toContain("150.00");
  });
});

describe("resolveBookingVisitFeeDisplay", () => {
  it("uses explicit type price without estimate hint", () => {
    const result = resolveBookingVisitFeeDisplay({
      selectedType: { price_cents: 12000 },
      doctorConsultationFeeCents: 8000,
      isFlexible: false,
    });
    expect(result).toEqual({ cents: 12000, showEstimateHint: false });
  });

  it("falls back to doctor fee with estimate hint when type has no price", () => {
    const result = resolveBookingVisitFeeDisplay({
      selectedType: { price_cents: 0 },
      doctorConsultationFeeCents: 12500,
      isFlexible: false,
    });
    expect(result).toEqual({ cents: 12500, showEstimateHint: true });
  });

  it("uses default doctor visit fee for flexible booking", () => {
    const result = resolveBookingVisitFeeDisplay({
      selectedType: null,
      doctorConsultationFeeCents: null,
      isFlexible: true,
    });
    expect(result).toEqual({
      cents: DEFAULT_DOCTOR_VISIT_FEE_CENTS,
      showEstimateHint: true,
    });
  });

  it("returns null when no type selected and not flexible", () => {
    expect(
      resolveBookingVisitFeeDisplay({
        selectedType: null,
        doctorConsultationFeeCents: 10000,
        isFlexible: false,
      })
    ).toBeNull();
  });
});

describe("buildInvoiceVisitFeeStripLine", () => {
  it("includes resolved type fee and hint", () => {
    const line = buildInvoiceVisitFeeStripLine({
      typePriceCents: 12000,
      doctorConsultationFeeCents: 15000,
    });
    expect(line).toContain("€120.00");
    expect(line).toContain("visit type fee");
  });
});

describe("resolveDisplayedVisitFeeCents", () => {
  it("prefers type price over doctor fee", () => {
    expect(
      resolveDisplayedVisitFeeCents({
        typePriceCents: 9000,
        doctorConsultationFeeCents: 5000,
      })
    ).toBe(9000);
  });
});
