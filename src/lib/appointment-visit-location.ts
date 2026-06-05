/**
 * Shared visit location resolver — appointment cards, booking preview, detail, billing.
 * Telehealth visits omit a physical place (badge handles modality).
 */

export type AppointmentVisitLocationInput = {
  location?: string | null;
  is_telehealth?: boolean;
  /** Doctor `office_location` when `appointment.location` unset (legacy rows + booking preview). */
  office_location?: string | null;
};

export type ResolveAppointmentVisitLocationOptions = {
  /** Billing/API may use a telehealth placeholder instead of null. */
  telehealthPlaceholder?: string | null;
};

/** Resolve in-person visit place — null for telehealth or when no label exists. */
export function resolveAppointmentVisitLocationLabel(
  input: AppointmentVisitLocationInput,
  options?: ResolveAppointmentVisitLocationOptions
): string | null {
  if (input.is_telehealth) {
    return options?.telehealthPlaceholder ?? null;
  }
  const loc = input.location?.trim() || input.office_location?.trim();
  if (!loc || loc === "—") return null;
  if (/telehealth|video call/i.test(loc)) return null;
  return loc;
}

/** Pick doctor office fallback from embedded portal clinician rows. */
export function resolveAppointmentOfficeLocationFallback(appointment: {
  treating_physician?: { office_location?: string | null } | null;
  portal_treating_physician?: { office_location?: string | null } | null;
  owner?: { office_location?: string | null } | null;
  portal_owner?: { office_location?: string | null } | null;
}): string | null {
  const treating =
    appointment.treating_physician?.office_location ??
    appointment.portal_treating_physician?.office_location;
  const owner = appointment.owner?.office_location ?? appointment.portal_owner?.office_location;
  const pick = treating?.trim() || owner?.trim();
  return pick || null;
}

/** Combined resolver for appointment rows — persisted location then doctor office. */
export function resolveAppointmentDisplayLocation(
  appointment: AppointmentVisitLocationInput & {
    treating_physician?: { office_location?: string | null } | null;
    portal_treating_physician?: { office_location?: string | null } | null;
    owner?: { office_location?: string | null } | null;
    portal_owner?: { office_location?: string | null } | null;
  },
  options?: ResolveAppointmentVisitLocationOptions
): string | null {
  return resolveAppointmentVisitLocationLabel(
    {
      location: appointment.location,
      is_telehealth: appointment.is_telehealth,
      office_location: resolveAppointmentOfficeLocationFallback(appointment),
    },
    options
  );
}

/** Location to persist on patient self-book — telehealth omits physical place. */
export function resolvePatientBookingPersistedLocation(
  isTelehealth: boolean,
  doctorOfficeLocation?: string | null
): string | null {
  if (isTelehealth) return null;
  const office = doctorOfficeLocation?.trim();
  return office || null;
}
