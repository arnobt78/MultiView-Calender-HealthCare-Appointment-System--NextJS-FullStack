import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildAppointmentCancelConfirmSubtitle,
  buildAppointmentCancelConfirmTitle,
  buildAppointmentDeleteConfirmSubtitle,
  buildCpAdminAppointmentTypeDeleteConfirmSubtitle,
  buildOrganizationDeleteConfirmSubtitle,
} from "@/lib/confirm-delete-dialog-copy";

function subtitleText(
  input: Parameters<typeof buildCpAdminAppointmentTypeDeleteConfirmSubtitle>[0]
): string {
  return renderToStaticMarkup(
    <>{buildCpAdminAppointmentTypeDeleteConfirmSubtitle(input)}</>
  );
}

describe("buildCpAdminAppointmentTypeDeleteConfirmSubtitle", () => {
  it("mentions organization-wide for global types", () => {
    expect(
      subtitleText({
        user_id: null,
        name: "Consultation",
        duration_minutes: 30,
        price_cents: 15000,
      })
    ).toContain("organization-wide");
  });

  it("mentions owner for custom types", () => {
    const text = subtitleText({
      user_id: "doc-1",
      name: "Follow-up",
      duration_minutes: 20,
      owner_display_name: "Demo Doctor",
    });
    expect(text).toContain("Demo Doctor");
    expect(text).toContain("custom visit type");
  });
});

describe("buildOrganizationDeleteConfirmSubtitle", () => {
  it("includes org name", () => {
    expect(
      renderToStaticMarkup(<>{buildOrganizationDeleteConfirmSubtitle("Acme Clinic")}</>)
    ).toContain("Acme Clinic");
  });
});

describe("buildAppointmentDeleteConfirmSubtitle", () => {
  it("includes title for list context", () => {
    expect(
      renderToStaticMarkup(<>{buildAppointmentDeleteConfirmSubtitle("Check-up", "list")}</>)
    ).toContain("Check-up");
  });
});

describe("buildAppointmentCancelConfirmTitle", () => {
  it("quotes appointment title", () => {
    expect(buildAppointmentCancelConfirmTitle("Follow-up")).toBe('Cancel "Follow-up"?');
  });

  it("uses CANCEL_APPOINTMENT_CONFIRM_TITLE when title blank", () => {
    expect(buildAppointmentCancelConfirmTitle("")).toBe("Cancel appointment?");
    expect(buildAppointmentCancelConfirmTitle("   ")).toBe("Cancel appointment?");
  });
});

describe("buildAppointmentCancelConfirmSubtitle", () => {
  it("includes title range and patient", () => {
    const text = renderToStaticMarkup(
      <>
        {buildAppointmentCancelConfirmSubtitle("Check-up", {
          start: "2026-06-22T14:00:00.000Z",
          end: "2026-06-22T15:00:00.000Z",
          patientLabel: "Jane Doe",
        })}
      </>
    );
    expect(text).toContain("Check-up");
    expect(text).toContain("marked cancelled");
    expect(text).toContain("Jane Doe");
  });
});
