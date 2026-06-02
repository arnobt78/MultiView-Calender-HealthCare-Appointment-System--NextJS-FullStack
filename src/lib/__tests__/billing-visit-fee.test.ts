import { describe, it, expect } from "vitest";
import { resolveVisitFeeCents } from "@/lib/billing-visit-fee";

describe("resolveVisitFeeCents", () => {
  it("prefers appointment type price over doctor fee", () => {
    expect(
      resolveVisitFeeCents({ typePriceCents: 9250, doctorConsultationFeeCents: 15000 })
    ).toBe(9250);
  });

  it("falls back to doctor consultation_fee when type price is 0", () => {
    expect(
      resolveVisitFeeCents({ typePriceCents: 0, doctorConsultationFeeCents: 15000 })
    ).toBe(15000);
  });

  it("returns 0 when neither is set", () => {
    expect(resolveVisitFeeCents({ typePriceCents: 0, doctorConsultationFeeCents: 0 })).toBe(0);
  });
});
