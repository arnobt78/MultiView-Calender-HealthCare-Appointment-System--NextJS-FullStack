import { describe, expect, it } from "vitest";
import {
  SERVICES_CATALOG_FILTER_ALL,
  SERVICES_CATALOG_FILTER_GLOBAL,
  serviceCatalogFilterValue,
  type ServiceCatalogRow,
} from "@/lib/appointment-service-catalog";
import {
  doctorMatchesServiceCatalogSelection,
  filterDoctorsByServiceCatalog,
} from "@/lib/services-doctor-catalog-filter";

const catalog: ServiceCatalogRow[] = [
  {
    id: "g1",
    name: "Telehealth",
    description: null,
    duration_minutes: 30,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    slot_interval_minutes: 30,
    is_telehealth: true,
    price_cents: 0,
    source: "global",
  },
  {
    id: "a1",
    name: "Physio",
    description: null,
    duration_minutes: 45,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    slot_interval_minutes: 30,
    is_telehealth: false,
    price_cents: 0,
    source: "additional",
    doctor_offers: [{ id: "doc-b", label: "Dr B", specialty: null }],
  },
];

describe("filterDoctorsByServiceCatalog", () => {
  const doctors = [
    {
      id: "doc-a",
      appointment_types: [],
      bookable_appointment_types: [
        {
          id: "g1",
          name: "Telehealth",
          duration_minutes: 30,
          buffer_before_minutes: 0,
          buffer_after_minutes: 0,
          slot_interval_minutes: 30,
          is_global: true,
        },
      ],
    },
    {
      id: "doc-b",
      appointment_types: [{ id: "a1", name: "Physio" }],
      bookable_appointment_types: [],
    },
    {
      id: "doc-c",
      appointment_types: [],
      bookable_appointment_types: [],
    },
  ];

  it("returns all when selection is all", () => {
    expect(filterDoctorsByServiceCatalog(doctors, SERVICES_CATALOG_FILTER_ALL, catalog)).toHaveLength(
      3
    );
  });

  it("filters by enabled global bookable type", () => {
    const out = filterDoctorsByServiceCatalog(doctors, SERVICES_CATALOG_FILTER_GLOBAL, catalog);
    expect(out.map((d) => d.id)).toEqual(["doc-a"]);
  });

  it("filters by specific global type id", () => {
    const sel = serviceCatalogFilterValue("g1", "global");
    expect(doctorMatchesServiceCatalogSelection(doctors[0]!, sel, catalog)).toBe(true);
    expect(doctorMatchesServiceCatalogSelection(doctors[2]!, sel, catalog)).toBe(false);
  });

  it("filters additional via doctor_offers on catalog row", () => {
    const sel = serviceCatalogFilterValue("a1", "additional");
    expect(doctorMatchesServiceCatalogSelection(doctors[1]!, sel, catalog)).toBe(true);
    expect(doctorMatchesServiceCatalogSelection(doctors[0]!, sel, catalog)).toBe(false);
  });
});
