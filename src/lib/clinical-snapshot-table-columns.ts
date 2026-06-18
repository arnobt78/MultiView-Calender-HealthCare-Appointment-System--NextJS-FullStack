/**
 * Related Appointments table on patient/category detail — `<colgroup>` widths for `table-fixed`.
 * Column ids align with `buildRelatedAppointmentsColumns` for visibility + min-width math.
 */
export const RELATED_APPOINTMENTS_COLUMN_IDS = [
  "title",
  "when",
  "category",
  "calendar_owner",
  "treating_physician",
  "location",
] as const;

export type RelatedAppointmentsColumnId = (typeof RELATED_APPOINTMENTS_COLUMN_IDS)[number];

const RELATED_APPOINTMENTS_COL_WIDTH_REM: Record<RelatedAppointmentsColumnId, number> = {
  title: 10,
  when: 7.5,
  category: 11,
  calendar_owner: 10,
  treating_physician: 10,
  location: 8.5,
};

export const CLINICAL_SNAPSHOT_APPOINTMENT_COL_WIDTH = {
  title: "10rem",
  /** Fits `PP` date + `h:mm a – h:mm a` on two lines without clipping. */
  when: "9rem",
  category: "11rem",
  identity: "10rem",
  location: "8.5rem",
} as const;

/** Default — all related-appointment columns visible (patient detail). */
export const clinicalSnapshotAppointmentsTableMinWidthClass = "min-w-[57rem]";

/** Category detail hides redundant category column — same table, narrower min width. */
export const CATEGORY_DETAIL_RELATED_APPOINTMENTS_HIDDEN_COLUMNS: RelatedAppointmentsColumnId[] = [
  "category",
];

/** Min table width from visible column set (sum of `CLINICAL_SNAPSHOT_APPOINTMENT_COL_WIDTH` tokens). */
export function resolveClinicalSnapshotAppointmentsTableMinWidth(
  hiddenColumns: readonly RelatedAppointmentsColumnId[] = []
): string {
  const hidden = new Set(hiddenColumns);
  let rem = 0;
  for (const id of RELATED_APPOINTMENTS_COLUMN_IDS) {
    if (!hidden.has(id)) rem += RELATED_APPOINTMENTS_COL_WIDTH_REM[id];
  }
  return `min-w-[${rem}rem]`;
}
