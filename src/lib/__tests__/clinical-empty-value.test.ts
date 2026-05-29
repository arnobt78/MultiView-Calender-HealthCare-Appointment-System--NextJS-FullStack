import { describe, expect, it } from "vitest";
import {
  clinicalHasListValue,
  clinicalHasTextValue,
} from "@/lib/clinical-empty-value";

describe("clinical-empty-value", () => {
  it("clinicalHasTextValue", () => {
    expect(clinicalHasTextValue("a")).toBe(true);
    expect(clinicalHasTextValue("  x ")).toBe(true);
    expect(clinicalHasTextValue("")).toBe(false);
    expect(clinicalHasTextValue("   ")).toBe(false);
    expect(clinicalHasTextValue(null)).toBe(false);
  });

  it("clinicalHasListValue", () => {
    expect(clinicalHasListValue(["a"])).toBe(true);
    expect(clinicalHasListValue([])).toBe(false);
    expect(clinicalHasListValue(null)).toBe(false);
  });
});
