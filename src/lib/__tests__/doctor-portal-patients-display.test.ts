import { describe, expect, it } from "vitest";
import type { Patient } from "@/types/types";
import {
  countDoctorPortalPatientsByStatus,
  doctorPortalPatientStatusBadgeLabel,
  doctorPortalPatientsSectionTitle,
  filterDoctorPortalPatientRoster,
} from "@/lib/doctor-portal-patients-display";

const basePatient = (overrides: Partial<Patient>): Patient =>
  ({
    id: "p1",
    firstname: "A",
    lastname: "B",
    birth_date: null,
    care_level: null,
    pronoun: null,
    email: null,
    active: true,
    active_since: null,
    created_at: "2026-01-01",
    primary_doctor_id: "doc-1",
    ...overrides,
  }) as Patient;

describe("doctorPortalPatientsSectionTitle", () => {
  it("uses possessive display name", () => {
    expect(doctorPortalPatientsSectionTitle("Demo Doctor")).toBe(
      "Demo Doctor's Related Patients"
    );
  });
});

describe("filterDoctorPortalPatientRoster", () => {
  it("scopes by primary doctor", () => {
    const rows = [
      basePatient({ id: "p1", primary_doctor_id: "doc-1" }),
      basePatient({ id: "p2", primary_doctor_id: "doc-2" }),
    ];
    expect(filterDoctorPortalPatientRoster(rows, "doc-1")).toHaveLength(1);
  });
});

describe("doctorPortalPatientStatusBadgeLabel", () => {
  it("formats active and inactive counts", () => {
    const counts = countDoctorPortalPatientsByStatus([
      basePatient({ active: true }),
      basePatient({ id: "p2", active: false }),
    ]);
    expect(doctorPortalPatientStatusBadgeLabel(counts)).toBe("Active: 1 · Inactive: 1");
  });
});
