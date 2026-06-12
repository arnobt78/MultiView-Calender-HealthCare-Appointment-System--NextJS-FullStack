import { describe, expect, it } from "vitest";
import {
  buildServiceCatalog,
  filterServiceCatalog,
  SERVICES_CATALOG_FILTER_GLOBAL,
  serviceCatalogFilterValue,
} from "@/lib/appointment-service-catalog";

describe("buildServiceCatalog", () => {
  it("merges globals and dedupes additional types by name", () => {
    const services = buildServiceCatalog(
      [
        {
          id: "g1",
          name: "Initial Consultation",
          description: "Global",
          duration_minutes: 60,
          buffer_before_minutes: 10,
          buffer_after_minutes: 10,
          slot_interval_minutes: 30,
          is_telehealth: false,
          price_cents: 0,
          icon: "stethoscope",
          color: "#6366f1",
        },
      ],
      [
        {
          id: "a1",
          name: "Physio Theraphy",
          description: null,
          duration_minutes: 30,
          buffer_before_minutes: 5,
          buffer_after_minutes: 5,
          slot_interval_minutes: 30,
          is_telehealth: false,
          price_cents: 0,
          user_id: "d1",
          owner_display_name: "Dr. One",
          owner_email: "one@test.com",
          owner_specialty: "Medicine",
        },
        {
          id: "a2",
          name: "physio theraphy",
          description: null,
          duration_minutes: 45,
          buffer_before_minutes: 5,
          buffer_after_minutes: 5,
          slot_interval_minutes: 15,
          is_telehealth: false,
          price_cents: 0,
          user_id: "d2",
          owner_display_name: "Dr. Two",
          owner_email: "two@test.com",
          owner_specialty: "Cardiology",
        },
      ]
    );

    expect(services).toHaveLength(2);
    const global = services.find((s) => s.source === "global");
    expect(global?.icon).toBe("stethoscope");
    expect(global?.color).toBe("#6366f1");
    const additional = services.find((s) => s.source === "additional");
    expect(additional?.name).toBe("Physio Theraphy");
    expect(additional?.duration_minutes).toBe(30);
    expect(additional?.doctor_offers).toEqual([
      { id: "d1", label: "Dr. One", specialty: "Medicine" },
      { id: "d2", label: "Dr. Two", specialty: "Cardiology" },
    ]);
  });
});

describe("filterServiceCatalog", () => {
  const rows = buildServiceCatalog(
    [
      {
        id: "g1",
        name: "Follow-up",
        description: null,
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
        is_telehealth: false,
        price_cents: 0,
      },
    ],
    []
  );

  it("filters by single type selection", () => {
    const filtered = filterServiceCatalog(rows, {
      selection: serviceCatalogFilterValue("g1", "global"),
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.name).toBe("Follow-up");
  });

  it("filters global bucket", () => {
    const filtered = filterServiceCatalog(rows, {
      selection: SERVICES_CATALOG_FILTER_GLOBAL,
    });
    expect(filtered.every((r) => r.source === "global")).toBe(true);
  });
});
