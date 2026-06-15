import { describe, it, expect } from "vitest";
import {
  isRedundantTelehealthVisitTypeLabel,
  mapTelehealthQueueCategory,
  mapTelehealthQueueTreatingDoctor,
  resolveTelehealthQueuePhysicalLocation,
} from "@/lib/telehealth-queue-display";
import type { FullAppointment } from "@/hooks/useAppointments";

function appt(overrides: Partial<FullAppointment>): FullAppointment {
  return {
    id: "a1",
    start: "2026-06-16T09:00:00Z",
    end: "2026-06-16T09:20:00Z",
    title: "Visit",
    status: "pending",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
    location: null,
    patient: null,
    attachments: [],
    category: null,
    notes: null,
    user_id: "user-1",
    is_telehealth: true,
    ...overrides,
  } as FullAppointment;
}

describe("resolveTelehealthQueuePhysicalLocation", () => {
  it("returns trimmed physical location on telehealth visits", () => {
    expect(
      resolveTelehealthQueuePhysicalLocation(
        appt({ location: "  Clinic Room 3  " })
      )
    ).toBe("Clinic Room 3");
  });

  it("returns null for telehealth/video placeholder strings", () => {
    expect(resolveTelehealthQueuePhysicalLocation(appt({ location: "Video Call" }))).toBeNull();
    expect(
      resolveTelehealthQueuePhysicalLocation(appt({ location: "Telehealth Session" }))
    ).toBeNull();
  });

  it("returns null for empty or dash", () => {
    expect(resolveTelehealthQueuePhysicalLocation(appt({ location: null }))).toBeNull();
    expect(resolveTelehealthQueuePhysicalLocation(appt({ location: "—" }))).toBeNull();
  });
});

describe("isRedundantTelehealthVisitTypeLabel", () => {
  it("flags generic telehealth labels", () => {
    expect(isRedundantTelehealthVisitTypeLabel("Telehealth Session")).toBe(true);
    expect(isRedundantTelehealthVisitTypeLabel("telehealth visit")).toBe(true);
    expect(isRedundantTelehealthVisitTypeLabel("Telehealth")).toBe(true);
  });

  it("allows distinct visit type names", () => {
    expect(isRedundantTelehealthVisitTypeLabel("Initial Consultation")).toBe(false);
    expect(isRedundantTelehealthVisitTypeLabel("Follow-up Video")).toBe(false);
  });
});

describe("mapTelehealthQueueCategory", () => {
  it("maps category_data when id and label exist", () => {
    const result = mapTelehealthQueueCategory(
      appt({
        category_data: {
          id: "cat-1",
          label: "Cardiology",
          color: "#8b5cf6",
          icon: "heart",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: null,
          description: null,
        },
      })
    );
    expect(result).toEqual({
      id: "cat-1",
      label: "Cardiology",
      color: "#8b5cf6",
      icon: "heart",
    });
  });

  it("returns null when category_data missing or label empty", () => {
    expect(mapTelehealthQueueCategory(appt({ category_data: undefined }))).toBeNull();
    expect(
      mapTelehealthQueueCategory(
        appt({
          category_data: {
            id: "cat-1",
            label: "  ",
            color: null,
            icon: null,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: null,
            description: null,
          },
        })
      )
    ).toBeNull();
  });
});

describe("mapTelehealthQueueTreatingDoctor", () => {
  it("resolves treating physician from doctors directory on staff appointments", () => {
    const result = mapTelehealthQueueTreatingDoctor(
      appt({ user_id: "owner-1", treating_physician_id: "doc-9" }),
      [
        {
          id: "doc-9",
          email: "dr@test.com",
          display_name: "Dr. Smith",
          image: null,
          specialty: "Cardiology",
          availabilities: [],
          appointment_types: [],
          bookable_appointment_types: [],
        },
      ]
    );
    expect(result?.display_name).toBe("Dr. Smith");
    expect(result?.specialty).toBe("Cardiology");
  });
});
