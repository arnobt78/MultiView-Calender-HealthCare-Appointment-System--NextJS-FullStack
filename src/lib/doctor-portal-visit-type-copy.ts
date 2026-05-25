/**
 * Doctor portal visit-type panels — subtitles on `PortalPanelSubsectionHeader` / stacked `PortalPanelSection`.
 */

import { toTitleCaseLabel } from "@/lib/utils";

export const DOCTOR_PORTAL_VISIT_TYPE_COPY = {
  patientTypesSubtitle: toTitleCaseLabel(
    "Choose which shared visit types patients can book with you. Turned-off types stay off your profile and booking flow."
  ),
  additionalTypesSubtitle: toTitleCaseLabel(
    "Add custom visit types for your practice. They appear on your Services page with organization templates."
  ),
  /** @deprecated Portal uses `patientTypesSubtitle` on the section header — kept for CP blurbs. */
  patientTypesIntro: toTitleCaseLabel(
    "Choose which shared visit types patients can book with you. Turned-off types stay off your profile and booking flow."
  ),
  /** @deprecated Portal uses `additionalTypesSubtitle` on the section header. */
  additionalTypesIntro: toTitleCaseLabel(
    "Add custom visit types for your practice. They appear on your Services page with organization templates."
  ),
  emptyGlobalTypes: toTitleCaseLabel("No shared visit templates are set up yet."),
  emptyOwnedTypes: toTitleCaseLabel("No custom types yet — use Add Appointment Type below."),
} as const;

export const ADDITIONAL_TYPE_ADD_SUMMARY_LABEL = toTitleCaseLabel("Add Appointment Type");
export const ADDITIONAL_TYPE_SAVE_LABEL = toTitleCaseLabel("Save Appointment Type");
