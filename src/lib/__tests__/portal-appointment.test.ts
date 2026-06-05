import { describe, expect, it } from "vitest";
import {
  attachPortalClinicianToFullAppointment,
  formatClinicianNameEmailLabel,
  portalAppointmentToFullAppointment,
  portalOwnerDisplayLabel,
  portalClinicianDisplayLabel,
  portalTreatingDisplayLabel,
  resolvePrimaryDoctorCardLabel,
} from "@/lib/portal-appointment";
import { mapPortalAppointmentsFromRows } from "@/lib/serializers";
import { portalDoctorProfileHref } from "@/lib/entity-routes";

describe("mapPortalAppointmentsFromRows", () => {
  it("keeps category UUID and adds category_data with id", () => {
    const rows = mapPortalAppointmentsFromRows([
      {
        id: "a1",
        created_at: new Date(),
        updated_at: null,
        start: new Date(),
        end: new Date(),
        location: null,
        patient_id: "p1",
        category_id: "cat-1",
        notes: null,
        title: "Test",
        status: "pending",
        owner_id: "u1",
        category: { id: "cat-1", label: "Test", color: "#6366f1" },
        owner: {
          id: "u1",
          display_name: "Demo Doctor",
          email: "doc@test.com",
          role: "doctor",
          image: null,
          specialty: null,
          office_location: null,
        },
      },
    ]);
    expect(rows[0].category).toBe("cat-1");
    expect(rows[0].category_data?.id).toBe("cat-1");
    expect(rows[0].category_data?.label).toBe("Test");
    expect(rows[0].owner?.id).toBe("u1");
    expect(rows[0].owner?.role).toBe("doctor");
  });
});

describe("attachPortalClinicianToFullAppointment", () => {
  it("sets portal_owner and portal_treating for patient dashboard cards", () => {
    const row = mapPortalAppointmentsFromRows([
      {
        id: "a1",
        created_at: new Date(),
        updated_at: null,
        start: new Date(),
        end: new Date(),
        location: null,
        patient_id: "p1",
        category_id: null,
        notes: null,
        title: "Visit",
        status: "pending",
        owner_id: "u1",
        treating_physician_id: "u2",
        owner: {
          id: "u1",
          display_name: "Demo Admin",
          email: "admin@test.com",
          role: "admin",
          image: null,
          specialty: null,
          office_location: null,
        },
        treating_physician: {
          id: "u2",
          display_name: "Demo Doctor 2",
          email: "d2@test.com",
          role: "doctor",
          image: null,
          specialty: null,
          office_location: null,
        },
      },
    ])[0];
    const full = attachPortalClinicianToFullAppointment(row);
    expect(full.portal_owner?.id).toBe("u1");
    expect(portalClinicianDisplayLabel(full.portal_owner)).toBe("Demo Admin (admin@test.com)");
    expect(portalClinicianDisplayLabel(full.portal_treating_physician)).toBe(
      "Demo Doctor 2 (d2@test.com)"
    );
  });
});

describe("formatClinicianNameEmailLabel", () => {
  it("never returns a UUID-shaped primary doctor label", () => {
    const label = formatClinicianNameEmailLabel("Demo Doctor", "doc@test.com");
    expect(label).toBe("Demo Doctor (doc@test.com)");
    expect(label).not.toMatch(/^[0-9a-f-]{36}$/i);
  });
});

describe("resolvePrimaryDoctorCardLabel", () => {
  const uuid = "fa0fa454-f677-4720-a27c-60ebfcd2a192";

  it("uses primary_doctor_display from patient_data instead of UUID", () => {
    const label = resolvePrimaryDoctorCardLabel(
      {
        id: "p1",
        primary_doctor_id: uuid,
        primary_doctor_display: "Demo Doctor",
        primary_doctor_email: "doc@test.com",
      } as Parameters<typeof resolvePrimaryDoctorCardLabel>[0],
      uuid,
      () => uuid
    );
    expect(label).toBe("Demo Doctor (doc@test.com)");
    expect(label).not.toBe(uuid);
  });

  it("returns null when lookup fails — never surfaces raw UUID", () => {
    const label = resolvePrimaryDoctorCardLabel(
      { id: "p1", primary_doctor_id: uuid } as Parameters<
        typeof resolvePrimaryDoctorCardLabel
      >[0],
      uuid,
      () => "--"
    );
    expect(label).toBeNull();
  });

  it("uses portal_owner label path when embedded staff present (empty ownerUsers)", () => {
    const row = mapPortalAppointmentsFromRows([
      {
        id: "a1",
        created_at: new Date(),
        updated_at: null,
        start: new Date(),
        end: new Date(),
        location: null,
        patient_id: "p1",
        category_id: null,
        notes: null,
        title: "Visit",
        status: "pending",
        owner_id: "u1",
        owner: {
          id: "u1",
          display_name: "Demo Admin",
          email: "admin@test.com",
          role: "admin",
          image: null,
          specialty: null,
          office_location: null,
        },
      },
    ])[0];
    const full = attachPortalClinicianToFullAppointment(row);
    expect(portalClinicianDisplayLabel(full.portal_owner)).toBe("Demo Admin (admin@test.com)");
  });
});

describe("portalAppointmentToFullAppointment", () => {
  it("maps portal row to FullAppointment with category_data", () => {
    const row = mapPortalAppointmentsFromRows([
      {
        id: "a1",
        created_at: new Date(),
        updated_at: null,
        start: new Date(),
        end: new Date(),
        location: "Berlin",
        patient_id: "p1",
        category_id: null,
        notes: null,
        title: "Visit",
        status: "pending",
        owner_id: "u1",
        owner: {
          id: "u1",
          display_name: "Owner",
          email: "o@test.com",
          role: "doctor",
          image: null,
          specialty: null,
          office_location: null,
        },
      },
    ])[0];
    const full = portalAppointmentToFullAppointment(row);
    expect(full.id).toBe("a1");
    expect(full.appointment_assignee).toEqual([]);
  });
});

describe("portal display labels", () => {
  it("formats display_name with email", () => {
    expect(
      portalOwnerDisplayLabel({
        id: "u1",
        display_name: "Demo Doctor",
        email: "d@test.com",
        role: "doctor",
        image: null,
        specialty: null,
        office_location: null,
      })
    ).toBe("Demo Doctor (d@test.com)");
  });
});

describe("portalDoctorProfileHref", () => {
  it("returns /doctors for patient viewer when staff is doctor", () => {
    expect(portalDoctorProfileHref("patient", "u1", "doctor")).toBe("/doctors/u1");
  });

  it("returns null for admin staff on patient portal", () => {
    expect(portalDoctorProfileHref("patient", "u1", "admin")).toBeNull();
  });
});

describe("portalTreatingDisplayLabel", () => {
  it("falls back to email", () => {
    expect(
      portalTreatingDisplayLabel({
        id: "u2",
        display_name: null,
        email: "t2@test.com",
        role: "doctor",
        image: null,
        specialty: null,
        office_location: null,
      })
    ).toBe("t2@test.com");
  });
});
