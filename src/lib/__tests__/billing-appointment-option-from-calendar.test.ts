import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  formatCalendarListDayHeadline,
  formatCalendarMonthFilterLabel,
} from "@/lib/calendar-date-display";
import { mapFullAppointmentToBillingOption } from "@/lib/billing-appointment-option-from-calendar";
import type { FullAppointment } from "@/hooks/useAppointments";
import { queryKeys } from "@/lib/query-keys";

describe("calendar-date-display", () => {
  it("formats list day headline in English", () => {
    const label = formatCalendarListDayHeadline(new Date(2026, 5, 22));
    expect(label).toBe("Monday, June 22");
  });

  it("formats month filter label in English", () => {
    expect(formatCalendarMonthFilterLabel(2026, 6)).toBe("June 2026");
  });
});

function baseAppt(): FullAppointment {
  return {
    id: "appt-month-1",
    created_at: "2026-06-01T10:00:00.000Z",
    updated_at: null,
    start: "2026-07-03T10:00:00.000Z",
    end: "2026-07-03T10:30:00.000Z",
    location: "Clinic A",
    patient: "patient-1",
    attachments: [],
    category: "cat-1",
    notes: null,
    title: "Demo visit",
    status: "pending",
    user_id: "owner-1",
    treating_physician_id: "doctor-1",
    appointment_type_price_cents: 9250,
    appointment_type_name: "Primary Care",
    patient_data: {
      id: "patient-1",
      firstname: "Demo",
      lastname: "Patient",
      email: "patient@example.com",
      birth_date: "1990-01-01",
      care_level: 1,
      clinical_profile: null,
    } as FullAppointment["patient_data"],
    category_data: {
      id: "cat-1",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: null,
      label: "Primary Care",
      description: null,
      color: "#22c55e",
      icon: "stethoscope",
    },
  };
}

describe("mapFullAppointmentToBillingOption", () => {
  it("maps calendar row with suggested fee and patient label", () => {
    const row = mapFullAppointmentToBillingOption(baseAppt());
    expect(row.id).toBe("appt-month-1");
    expect(row.patient_label).toBe("Demo Patient");
    expect(row.eligible).toBe(true);
    expect(row.suggested_amount_cents).toBe(9250);
    expect(row.when_label).toContain("03.07.2026");
  });

  it("resolves owner and treating labels from users.search cache", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.users.search("owner-1"), {
      id: "owner-1",
      email: "admin@test.com",
      display_name: "Demo Admin",
      image: null,
      specialty: null,
    });
    queryClient.setQueryData(queryKeys.users.search("doctor-1"), {
      id: "doctor-1",
      email: "doctor@test.com",
      display_name: "Demo Doctor",
      image: null,
      specialty: "Medicine",
    });

    const row = mapFullAppointmentToBillingOption(baseAppt(), [], { queryClient });
    expect(row.calendar_owner_label).toBe("Demo Admin (admin@test.com)");
    expect(row.treating_physician_label).toBe("Demo Doctor (doctor@test.com)");
    expect(row.treating_physician_specialty).toBe("Medicine");
  });

  it("uses cache key shape matching useBillingAppointmentOptionById", () => {
    const key = queryKeys.billing.appointmentOptions("appt-month-1", false);
    expect(key).toEqual(["app", "billing", "appointment-options", "appt-month-1", false]);
  });
});
