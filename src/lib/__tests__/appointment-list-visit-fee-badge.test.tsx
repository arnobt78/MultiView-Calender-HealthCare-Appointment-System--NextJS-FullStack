import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppointmentListVisitFeeBadge } from "@/components/shared/appointment-display/AppointmentListVisitFeeBadge";

describe("AppointmentListVisitFeeBadge", () => {
  it("renders type price without estimate hint", () => {
    const html = renderToStaticMarkup(
      createElement(AppointmentListVisitFeeBadge, {
        appointmentTypePriceCents: 12000,
        doctorConsultationFeeCents: 15000,
      })
    );
    expect(html).toContain("120,00");
    expect(html).not.toContain("· est.");
  });

  it("renders doctor fallback with estimate hint", () => {
    const html = renderToStaticMarkup(
      createElement(AppointmentListVisitFeeBadge, {
        appointmentTypePriceCents: 0,
        doctorConsultationFeeCents: 12500,
      })
    );
    expect(html).toContain("125,00");
    expect(html).toContain("· est.");
  });
});
