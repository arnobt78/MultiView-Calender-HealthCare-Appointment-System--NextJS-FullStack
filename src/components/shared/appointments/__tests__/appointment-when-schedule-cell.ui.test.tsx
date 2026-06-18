import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AppointmentWhenScheduleCell } from "@/components/shared/appointments/AppointmentWhenScheduleCell";
import type { AppointmentWhenScheduleSource } from "@/lib/appointment-when-schedule-display";

vi.mock("@/components/shared/appointment-display/AppointmentTypeGlassBadge", () => ({
  AppointmentTypeGlassBadge: ({
    name,
    durationLabel,
  }: {
    name: string;
    durationLabel?: string | null;
  }) => (
    <span data-testid="type-badge">
      {name}
      {durationLabel ? ` · ${durationLabel}` : ""}
    </span>
  ),
}));

vi.mock("@/components/shared/appointments/TelehealthSessionBadge", () => ({
  TelehealthSessionBadge: () => <span data-testid="telehealth-badge">Telehealth</span>,
}));

const baseSource: AppointmentWhenScheduleSource = {
  start: "2026-06-08T09:00:00.000Z",
  end: "2026-06-08T10:00:00.000Z",
  location: "Demo Clinic",
  is_telehealth: false,
  appointment_type_name: "Annual Check-up",
  duration_minutes: 60,
};

describe("AppointmentWhenScheduleCell", () => {
  it("management layout renders type badge inline with datetime", () => {
    const markup = renderToStaticMarkup(
      <AppointmentWhenScheduleCell source={baseSource} layout="management" />
    );
    expect(markup).toContain("Demo Clinic");
    expect(markup).toContain('data-testid="type-badge"');
    expect(markup).toContain("Annual Check-up");
    expect(markup).toContain("60 min");
    expect(markup).toContain("flex-wrap");
    expect(markup).toContain("inline-flex min-w-0 items-start gap-1");
  });

  it("snapshot layout renders type badge on time row", () => {
    const markup = renderToStaticMarkup(
      <AppointmentWhenScheduleCell
        source={{ ...baseSource, is_telehealth: true }}
        layout="snapshot"
      />
    );
    expect(markup).toContain('data-testid="type-badge"');
    expect(markup).toContain('data-testid="telehealth-badge"');
    expect(markup).toContain("–");
  });
});
