/**
 * Doctor portal visit-type panels — user-facing copy (titles live on `PortalPanelSection`).
 */

import { toTitleCaseLabel } from "@/lib/utils";

export const DOCTOR_PORTAL_VISIT_TYPE_COPY = {
  patientTypesIntro: toTitleCaseLabel(
    "Choose which organization visit templates patients can book with you. Disabled types are hidden from your public profile and booking flow."
  ),
  additionalTypesIntro: toTitleCaseLabel(
    "Create visit types unique to your practice. They appear on the Services page next to organization-wide templates."
  ),
  emptyGlobalTypes: toTitleCaseLabel("No organization visit templates are configured yet."),
  emptyOwnedTypes: toTitleCaseLabel(
    "No custom visit types yet — add your first type below to offer it on Services."
  ),
} as const;
