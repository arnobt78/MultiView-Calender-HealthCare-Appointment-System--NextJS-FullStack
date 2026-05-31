import { describe, expect, it } from "vitest";
import {
  DEFAULT_CATEGORY_ICON,
  normalizeCategoryIcon,
  categoryBrandColorFill,
} from "@/lib/category-icon-options";

describe("normalizeCategoryIcon", () => {
  it("returns default for empty or unknown values", () => {
    expect(normalizeCategoryIcon(null)).toBe(DEFAULT_CATEGORY_ICON);
    expect(normalizeCategoryIcon("")).toBe(DEFAULT_CATEGORY_ICON);
    expect(normalizeCategoryIcon("brain-circuit")).toBe(DEFAULT_CATEGORY_ICON);
  });

  it("normalizes known icon names", () => {
    expect(normalizeCategoryIcon("heart-pulse")).toBe("heart-pulse");
    expect(normalizeCategoryIcon(" Brain ")).toBe("brain");
  });
});

describe("categoryBrandColorFill", () => {
  it("falls back for invalid hex", () => {
    expect(categoryBrandColorFill("not-a-color")).toBe("#0ea5e9");
  });

  it("accepts valid hex", () => {
    expect(categoryBrandColorFill("#f59e0b")).toBe("#f59e0b");
  });
});
