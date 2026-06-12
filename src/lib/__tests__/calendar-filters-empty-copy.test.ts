import { describe, expect, it } from "vitest";
import { buildCalendarFiltersEmptyCopy } from "@/lib/calendar-filters-empty-copy";
import { CALENDAR_CLINICAL_ROLE_OWNER } from "@/lib/calendar-clinical-role-filter";

describe("buildCalendarFiltersEmptyCopy", () => {
  it("search-only empty state", () => {
    const copy = buildCalendarFiltersEmptyCopy({
      search: "demo",
      category: null,
      patient: null,
      date: null,
      status: null,
      month: null,
      clinicalRole: "all",
      totalAppointments: 8,
    });
    expect(copy.title).toBe("No search results");
    expect(copy.chips).toHaveLength(1);
    expect(copy.chips[0]?.label).toContain("demo");
  });

  it("multi-filter chips without search", () => {
    const copy = buildCalendarFiltersEmptyCopy({
      search: "",
      category: "cat-1",
      patient: "pat-1",
      date: null,
      status: null,
      month: null,
      clinicalRole: CALENDAR_CLINICAL_ROLE_OWNER,
      categoryLabel: "Pediatrics",
      patientLabel: "Demo Patient",
      totalAppointments: 8,
    });
    expect(copy.title).toBe("No appointments match your filters");
    expect(copy.chips.length).toBeGreaterThanOrEqual(3);
    expect(copy.description).toContain("8 appointments");
    expect(copy.chips.find((c) => c.icon === "visits")?.label).toBe("Created by Me");
  });

  it("status chip uses preset label for cancelled", () => {
    const copy = buildCalendarFiltersEmptyCopy({
      search: "",
      category: null,
      patient: null,
      date: null,
      status: "cancelled",
      month: null,
      clinicalRole: "all",
      totalAppointments: 3,
    });
    expect(copy.chips.find((c) => c.icon === "status")?.label).toBe("Cancelled");
  });
});
