import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Calendar, Stethoscope } from "lucide-react";
import { PortalAppointmentClinicianIdentityBlock } from "@/components/shared/portal-appointment/PortalAppointmentClinicianIdentityBlock";

vi.mock("@/components/shared/PortalClinicianLink", () => ({
  PortalClinicianLink: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("@/components/shared/doctor-display/DoctorAvatar", () => ({
  DoctorAvatar: () => <span data-testid="avatar" />,
}));

describe("PortalAppointmentClinicianIdentityBlock", () => {
  it("renders Admin badge for calendar owner with admin role", () => {
    const markup = renderToStaticMarkup(
      <PortalAppointmentClinicianIdentityBlock
        icon={<Calendar />}
        label="Calendar owner"
        clinician={{
          id: "admin-1",
          display_name: "Demo Admin",
          email: "test@admin.com",
          role: "admin",
          image: null,
          specialty: null,
        }}
      />
    );
    expect(markup).toContain("Demo Admin");
    expect(markup).toContain("Admin");
  });

  it("renders Doctor badge for treating physician", () => {
    const markup = renderToStaticMarkup(
      <PortalAppointmentClinicianIdentityBlock
        icon={<Stethoscope />}
        label="Treating physician"
        clinician={{
          id: "doc-1",
          display_name: "Demo Doctor 2",
          email: "test@doctor.com",
          role: "doctor",
          image: null,
          specialty: "Cardiology",
        }}
      />
    );
    expect(markup).toContain("Demo Doctor 2");
    expect(markup).toContain("Doctor");
    expect(markup).toContain("Cardiology");
  });
});
