import { describe, it, expect } from "vitest";
import { buildCategorySubmitPayload, EMPTY_CATEGORY_FORM } from "@/lib/category-form-state";

describe("buildCategorySubmitPayload", () => {
  it("sends null when default duration is cleared so PUT clears the column", () => {
    const payload = buildCategorySubmitPayload({
      ...EMPTY_CATEGORY_FORM,
      label: "Cardiology",
      duration_minutes_default: undefined,
    });
    expect(payload.duration_minutes_default).toBeNull();
  });

  it("keeps numeric default duration", () => {
    const payload = buildCategorySubmitPayload({
      ...EMPTY_CATEGORY_FORM,
      label: "Cardiology",
      duration_minutes_default: 45,
    });
    expect(payload.duration_minutes_default).toBe(45);
  });
});
