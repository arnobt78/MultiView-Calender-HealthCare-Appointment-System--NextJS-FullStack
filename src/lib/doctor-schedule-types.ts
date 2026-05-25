/**
 * Shared types for doctor weekly availability + time-off editors (CP + doctor portal).
 */

export type DoctorSettingsVariant = "portal" | "control-panel";

/** Portal: collapsed `<details>` per weekday + add form; CP: flat list (legacy card height). */
export type DoctorSettingsEditorLayout = "flat" | "collapsible";

export type AvailabilityWindow = {
  id: string;
  weekday: number;
  start_min: number;
  end_min: number;
  timezone: string;
};

export type TimeOffBlock = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};

export type AvailabilityWindowPatch = Partial<
  Pick<AvailabilityWindow, "weekday" | "start_min" | "end_min" | "timezone">
>;
