/**
 * Human-readable scheduling hints — shared by booking tiles, doctor picker chips, `/services`.
 */

export type AppointmentTypeSchedulingFields = {
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  is_global?: boolean;
};

/** Compact meta for inline chips (buffer + slot step; “Custom” prefix for doctor-owned). */
export function formatAppointmentTypeChipMeta(
  type: AppointmentTypeSchedulingFields
): string {
  const parts: string[] = [];
  if (!type.is_global) parts.push("Custom");
  if (type.buffer_before_minutes > 0 || type.buffer_after_minutes > 0) {
    parts.push(`buf ${type.buffer_before_minutes}+${type.buffer_after_minutes}m`);
  }
  parts.push(`step ${type.slot_interval_minutes}m`);
  return parts.join(" · ");
}

/** Booking tile footer — matches chip rules; omits line when nothing to show. */
export function formatAppointmentTypeBufferLine(
  type: AppointmentTypeSchedulingFields
): string | null {
  if (type.buffer_before_minutes <= 0 && type.buffer_after_minutes <= 0) {
    return null;
  }
  return `Buffer: ${type.buffer_before_minutes}m before · ${type.buffer_after_minutes}m after`;
}

/** Extra line when buffers are zero but slot step still matters for patients. */
export function formatAppointmentTypeSlotStepLine(
  type: AppointmentTypeSchedulingFields
): string | null {
  if (type.buffer_before_minutes > 0 || type.buffer_after_minutes > 0) {
    return null;
  }
  return `Slot step ${type.slot_interval_minutes} min between bookings`;
}

/** Patient-facing parenthetical beside confirm time — full words, not chip abbreviations. */
export function formatAppointmentTypeSchedulingBracket(
  type: AppointmentTypeSchedulingFields | null | undefined
): string | null {
  if (!type) return null;
  const parts: string[] = [];
  const before = type.buffer_before_minutes;
  const after = type.buffer_after_minutes;

  if (before > 0 && after > 0) {
    parts.push(`${before} min buffer before and ${after} min after`);
  } else if (before > 0) {
    parts.push(`${before} min buffer before`);
  } else if (after > 0) {
    parts.push(`${after} min buffer after`);
  }

  parts.push(`slots every ${type.slot_interval_minutes} min`);
  return parts.join(" · ");
}
