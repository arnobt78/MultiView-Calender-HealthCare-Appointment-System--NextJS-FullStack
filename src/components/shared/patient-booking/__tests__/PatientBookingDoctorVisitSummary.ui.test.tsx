import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PatientBookingDoctorVisitSummary } from "@/components/shared/patient-booking/PatientBookingDoctorVisitSummary";
import type { PatientBookingAppointmentType } from "@/lib/patient-booking-wizard";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";

vi.mock("@/components/shared/doctor-display/DoctorAvatar", () => ({
  DoctorAvatar: () => <span data-testid="avatar" />,
}));

vi.mock("@/components/shared/doctor-display/DoctorAvailabilityGroups", () => ({
  DoctorAvailabilityGroups: () => <span data-testid="availability" />,
}));

const doctor = {
  id: "doc-1",
  display_name: "Demo Doctor 2",
  email: "test@doctor.com",
  specialty: "Cardiology",
  consultation_fee: 8500,
  office_location: "Clinic A",
  availabilities: [],
} as unknown as DoctorDirectoryRow;

const telehealthType = {
  id: "type-1",
  name: "Telehealth Session",
  duration_minutes: 20,
  price_cents: 8500,
  is_telehealth: true,
} as PatientBookingAppointmentType;

describe("PatientBookingDoctorVisitSummary schedule telehealth", () => {
  it("does not render duplicate Telehealth chip row before date pick", () => {
    const markup = renderToStaticMarkup(
      <PatientBookingDoctorVisitSummary
        layout="schedule"
        doctor={doctor}
        selectedType={telehealthType}
        isFlexible={false}
        flexDuration={30}
      />
    );
    expect(markup).toContain("Telehealth Session");
    expect(markup).not.toContain(">Telehealth<");
  });
});
