/**
 * Visit type labels for appointment cards — prefers FK `appointment_type.name`, then title heuristic.
 */

export type AppointmentTypeDisplaySource = {
  appointment_type_name?: string | null;
  title?: string | null;
  duration_minutes?: number | null;
  appointment_type_duration_minutes?: number | null;
};

/** Resolved visit type name for category meta row chips. */
export function resolveAppointmentTypeDisplayName(
  source: AppointmentTypeDisplaySource
): string | null {
  const fromFk = source.appointment_type_name?.trim();
  if (fromFk) return fromFk;
  const title = source.title?.trim() ?? "";
  const sep = " — ";
  const idx = title.indexOf(sep);
  if (idx >= 0) {
    const tail = title.slice(idx + sep.length).trim();
    if (tail) return tail;
  }
  return null;
}

/** Minutes shown next to type chip — appointment override wins over type default. */
export function resolveAppointmentTypeDurationMinutes(
  source: AppointmentTypeDisplaySource
): number | null {
  const booked = source.duration_minutes;
  if (typeof booked === "number" && booked > 0) return booked;
  const typeDefault = source.appointment_type_duration_minutes;
  if (typeof typeDefault === "number" && typeDefault > 0) return typeDefault;
  return null;
}

export function formatAppointmentTypeDurationLabel(minutes: number | null): string | null {
  if (minutes == null || minutes <= 0) return null;
  return `${minutes} min`;
}

/** True when the shared category/type meta row should render (category optional). */
export function shouldShowAppointmentCategoryTypeRow(
  source: AppointmentTypeDisplaySource,
  displayFeeCents?: number | null
): boolean {
  return (
    Boolean(resolveAppointmentTypeDisplayName(source)) ||
    (displayFeeCents ?? 0) > 0
  );
}
