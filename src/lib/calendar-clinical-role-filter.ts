/**
 * Dashboard calendar — narrow staff-visible appointments by calendar ownership vs treating role.
 * API list already scopes owner OR treating; this filter subdivides that set client-side.
 */

export const CALENDAR_CLINICAL_ROLE_ALL = "all" as const;
export const CALENDAR_CLINICAL_ROLE_OWNER = "calendar_owner" as const;
export const CALENDAR_CLINICAL_ROLE_TREATING = "treating_referred" as const;

export type CalendarClinicalRoleFilter =
  | typeof CALENDAR_CLINICAL_ROLE_ALL
  | typeof CALENDAR_CLINICAL_ROLE_OWNER
  | typeof CALENDAR_CLINICAL_ROLE_TREATING;

export const CALENDAR_CLINICAL_ROLE_FILTER_OPTIONS: readonly {
  value: CalendarClinicalRoleFilter;
  label: string;
}[] = [
  { value: CALENDAR_CLINICAL_ROLE_ALL, label: "All My Visits" },
  { value: CALENDAR_CLINICAL_ROLE_OWNER, label: "Created by Me" },
  {
    value: CALENDAR_CLINICAL_ROLE_TREATING,
    label: "Referred to Me (Treating)",
  },
] as const;

export function calendarClinicalRoleFilterLabel(
  value: CalendarClinicalRoleFilter
): string {
  return (
    CALENDAR_CLINICAL_ROLE_FILTER_OPTIONS.find((o) => o.value === value)?.label ??
    "All My Visits"
  );
}

type AppointmentRoleSource = {
  user_id: string;
  treating_physician_id?: string | null;
};

/** Client-side slice on top of staff calendar API scope (owner OR treating). */
export function appointmentMatchesClinicalRoleFilter(
  appt: AppointmentRoleSource,
  viewerId: string,
  filter: CalendarClinicalRoleFilter
): boolean {
  if (filter === CALENDAR_CLINICAL_ROLE_ALL) return true;
  if (filter === CALENDAR_CLINICAL_ROLE_OWNER) {
    return appt.user_id === viewerId;
  }
  const treatingId = appt.treating_physician_id?.trim();
  if (!treatingId || treatingId !== viewerId) return false;
  return appt.user_id !== viewerId;
}
