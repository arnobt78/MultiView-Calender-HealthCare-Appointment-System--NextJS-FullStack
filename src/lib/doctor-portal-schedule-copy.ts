/**
 * Portal-facing copy for doctor schedule panels — title + subtitle strings stay centralized.
 */

import { toTitleCaseLabel } from "@/lib/utils";

export const TIME_OFF_PORTAL_SUBTITLE = toTitleCaseLabel(
  "Dates you're away — patients cannot book; these override your weekly hours"
);

export const WEEKLY_HOURS_SECTION_TITLE = toTitleCaseLabel("Weekly Hours");
export const UNAVAILABLE_DATES_SECTION_TITLE = toTitleCaseLabel("Unavailable Dates");

export const WEEKLY_ADD_WINDOW_SUMMARY_LABEL = toTitleCaseLabel("Add Weekly Time Window");
export const TIME_OFF_ADD_BLOCK_SUMMARY_LABEL = toTitleCaseLabel("Block Time Away");

export const WEEKLY_SAVE_WINDOW_LABEL = toTitleCaseLabel("Save Time Window");
export const TIME_OFF_SAVE_BLOCK_LABEL = toTitleCaseLabel("Save Time Away");
