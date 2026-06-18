import { describe, expect, it } from "vitest";
import {
  EMPTY_CATEGORIES,
  EMPTY_INVOICES,
  EMPTY_ORG_MEMBERS,
  EMPTY_ORGANIZATIONS,
  EMPTY_PATIENTS,
} from "@/lib/stable-query-fallbacks";

describe("stable-query-fallbacks", () => {
  it("EMPTY_* constants keep stable references across reads", () => {
    expect(EMPTY_PATIENTS).toBe(EMPTY_PATIENTS);
    expect(EMPTY_CATEGORIES).toBe(EMPTY_CATEGORIES);
    expect(EMPTY_ORGANIZATIONS).toBe(EMPTY_ORGANIZATIONS);
    expect(EMPTY_ORG_MEMBERS).toBe(EMPTY_ORG_MEMBERS);
    expect(EMPTY_INVOICES).toBe(EMPTY_INVOICES);
  });

  it("EMPTY_* fallbacks are frozen empty arrays", () => {
    expect(EMPTY_PATIENTS).toHaveLength(0);
    expect(EMPTY_CATEGORIES).toHaveLength(0);
    expect(EMPTY_ORGANIZATIONS).toHaveLength(0);
    expect(EMPTY_ORG_MEMBERS).toHaveLength(0);
    expect(EMPTY_INVOICES).toHaveLength(0);
  });
});
