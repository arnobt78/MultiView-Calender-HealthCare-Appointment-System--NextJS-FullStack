/**
 * Related Appointments table on patient detail — `<colgroup>` widths for `table-fixed` (no column bleed).
 */
export const CLINICAL_SNAPSHOT_APPOINTMENT_COL_WIDTH = {
  title: "10rem",
  /** Fits `PP` date + `h:mm a – h:mm a` on two lines without clipping. */
  when: "7.5rem",
  category: "11rem",
  identity: "10rem",
  location: "8.5rem",
} as const;

export const clinicalSnapshotAppointmentsTableMinWidthClass = "min-w-[57rem]";
