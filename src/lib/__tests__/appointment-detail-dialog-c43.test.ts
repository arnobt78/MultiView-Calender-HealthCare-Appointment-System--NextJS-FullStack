import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** C43 — detail edit uses dialog; action bar must not submit inline form. */
describe("AppointmentDetailActionBar C43", () => {
  it("opens dialog via Update Appointment — no inline form submit", () => {
    const src = readFileSync(
      resolve(process.cwd(), "src/components/shared/appointment-detail/AppointmentDetailActionBar.tsx"),
      "utf8"
    );
    expect(src).not.toContain("APPOINTMENT_DETAIL_EDIT_FORM_ID");
    expect(src).not.toContain("appointment-detail-edit");
    expect(src).toContain("Update Appointment");
    expect(src).toContain("onEditClick");
  });

  it("detail screen mounts AppointmentDialogController — no AppointmentDetailForm", () => {
    const src = readFileSync(
      resolve(
        process.cwd(),
        "src/components/shared/appointment-detail/AppointmentDetailScreenShared.tsx"
      ),
      "utf8"
    );
    expect(src).toContain("AppointmentDialogController");
    expect(src).not.toContain("AppointmentDetailForm");
    expect(src).not.toContain("APPOINTMENT_DETAIL_EDIT_FORM_ID");
    expect(src).not.toContain("router.refresh");
  });

  it("AppointmentDialog does not auto-open when controlled closed", () => {
    const src = readFileSync(
      resolve(process.cwd(), "src/components/calendar/AppointmentDialog.tsx"),
      "utf8"
    );
    expect(src).toContain("isControlled ? isOpen : isEditMode");
    expect(src).toContain("if (!isControlled)");
    expect(src).not.toMatch(/setSlotPickTypeId\([^)]+\);\s*setOpen\(true\)/);
  });

  it("AppointmentDialog re-seeds form when dialog opens after close reset", () => {
    const src = readFileSync(
      resolve(process.cwd(), "src/components/calendar/AppointmentDialog.tsx"),
      "utf8"
    );
    expect(src).toContain("seedFormFromAppointment");
    expect(src).toContain("prevControlledIsOpenRef");
    expect(src).toContain("nextOpen && !wasOpen && appointmentRef.current");
  });
});

describe("buildFullAppointmentForDialog", () => {
  it("maps patient and category onto FullAppointment shape", async () => {
    const { buildFullAppointmentForDialog } = await import("@/lib/appointment-detail-dialog");
    const detail = {
      appointmentId: "a1",
      appointment: { id: "a1", title: "Visit", patient: "p1", category: "c1" },
      patient: { id: "p1", firstname: "Demo", lastname: "Patient", email: "p@test.com" },
      category: { id: "c1", label: "Cardiology", color: "#fff", icon: "heart" },
      assignees: [],
    } as unknown as import("@/lib/appointment-detail-view-model").AppointmentDetailViewModel;
    const full = buildFullAppointmentForDialog(detail, []);
    expect(full.patient_data?.id).toBe("p1");
    expect(full.category_data?.id).toBe("c1");
  });

  it("maps treating physician to directory seed for instant picker label", async () => {
    const { buildFullAppointmentForDialog, mapDetailClinicianToDirectoryRow } =
      await import("@/lib/appointment-detail-dialog");
    const clinician = {
      id: "doc-1",
      display_name: "Demo Doctor",
      email: "doc@test.com",
      role: "doctor",
      image: null,
      specialty: "GP",
      consultation_fee: 5000,
    };
    const row = mapDetailClinicianToDirectoryRow(clinician);
    expect(row.id).toBe("doc-1");
    expect(row.display_name).toBe("Demo Doctor");

    const detail = {
      appointmentId: "a1",
      appointment: { id: "a1", title: "Visit" },
      treatingPhysician: clinician,
      assignees: [],
    } as unknown as import("@/lib/appointment-detail-view-model").AppointmentDetailViewModel;
    const full = buildFullAppointmentForDialog(detail, []);
    expect(full.treating_physician_directory_seed?.id).toBe("doc-1");
  });
});

describe("enrichFullAppointmentDialogSeeds C44", () => {
  it("builds visit type seed from list row fields", async () => {
    const { buildVisitTypeSeedFromAppointmentRow } = await import("@/lib/appointment-detail-dialog");
    const seed = buildVisitTypeSeedFromAppointmentRow({
      appointment_type_id: "type-1",
      appointment_type_name: "Follow-up",
      appointment_type_duration_minutes: 20,
    });
    expect(seed?.id).toBe("type-1");
    expect(seed?.name).toBe("Follow-up");
    expect(seed?.duration_minutes).toBe(20);
  });

  it("enriches calendar list row with doctors cache and portal fallback", async () => {
    const {
      enrichFullAppointmentDialogSeeds,
      mapPortalClinicianToDirectoryRow,
    } = await import("@/lib/appointment-detail-dialog");
    const doctors = [
      {
        id: "doc-2",
        email: "d2@test.com",
        display_name: "Cached Doctor",
        image: null,
        specialty: "GP",
        availabilities: [],
        appointment_types: [],
        bookable_appointment_types: [],
        consultation_fee: null,
      },
    ];
    const appt = {
      id: "a1",
      title: "Visit",
      treating_physician_id: "doc-2",
      appointment_type_id: "t1",
      appointment_type_name: "Consult",
      appointment_type_duration_minutes: 30,
    } as import("@/hooks/useAppointments").FullAppointment;

    const enriched = enrichFullAppointmentDialogSeeds(appt, doctors);
    expect(enriched.treating_physician_directory_seed?.display_name).toBe("Cached Doctor");
    expect(enriched.appointment_type_visit_seed?.name).toBe("Consult");

    const portalRow = mapPortalClinicianToDirectoryRow({
      id: "doc-3",
      email: "d3@test.com",
      display_name: "Portal Doc",
      role: "doctor",
    });
    expect(portalRow.id).toBe("doc-3");

    const withPortal = enrichFullAppointmentDialogSeeds(
      {
        id: "a2",
        title: "V2",
        portal_treating_physician: {
          id: "doc-3",
          email: "d3@test.com",
          display_name: "Portal Doc",
          role: "doctor",
        },
      } as import("@/hooks/useAppointments").FullAppointment,
      []
    );
    expect(withPortal.treating_physician_directory_seed?.display_name).toBe("Portal Doc");
  });

  it("is idempotent when SSR seeds already present", async () => {
    const { enrichFullAppointmentDialogSeeds } = await import("@/lib/appointment-detail-dialog");
    const existing = {
      id: "a1",
      treating_physician_directory_seed: { id: "seed-doc" },
      appointment_type_visit_seed: { id: "seed-type", name: "SSR Type", duration_minutes: 15 },
    } as import("@/hooks/useAppointments").FullAppointment;
    const result = enrichFullAppointmentDialogSeeds(existing, []);
    expect(result).toBe(existing);
  });
});
