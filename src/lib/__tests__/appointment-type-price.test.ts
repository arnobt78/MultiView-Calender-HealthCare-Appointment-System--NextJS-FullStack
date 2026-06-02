import { describe, it, expect } from "vitest";
import {
  formatCentsToPriceInput,
  formatVisitFeeAmountLabel,
  parsePriceEurInputToCents,
} from "@/lib/appointment-type-price";

describe("appointment-type-price", () => {
  it("parses EUR input to cents", () => {
    expect(parsePriceEurInputToCents("")).toBe(0);
    expect(parsePriceEurInputToCents("92.50")).toBe(9250);
    expect(parsePriceEurInputToCents("92,50")).toBe(9250);
  });

  it("formats cents for form fields and badges", () => {
    expect(formatCentsToPriceInput(0)).toBe("");
    expect(formatCentsToPriceInput(9250)).toBe("92.50");
    expect(formatVisitFeeAmountLabel(9250)).toBe("92,50");
  });
});
