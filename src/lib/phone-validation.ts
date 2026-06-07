/**
 * Contact phone validation — patient/user records + Brevo transactional SMS recipient.
 * Accepts E.164 (+country) or local formats with 7–15 digits after stripping separators.
 */

/** Allowed chars: digits, +, spaces, dashes, dots, parentheses. */
const PHONE_CHARS = /^\+?[0-9()\-.\s]+$/;

export function countPhoneDigits(value: string): number {
  return value.replace(/\D/g, "").length;
}

/** Non-empty value must be 7–15 digits with allowed formatting characters only. */
export function isValidContactPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 30) return false;
  if (!PHONE_CHARS.test(trimmed)) return false;
  const digits = countPhoneDigits(trimmed);
  return digits >= 7 && digits <= 15;
}

/** Trim whitespace; empty → null (persisted as DB null). */
export function normalizePhoneWhitespace(value: string): string | null {
  const t = value.trim();
  return t || null;
}

export type PatientPhoneParseResult =
  | { ok: true; phone: string | null }
  | { ok: false; error: string };

const INVALID_PHONE_MESSAGE =
  "Phone must be 7–15 digits; use + and country code for SMS (e.g. +491701234567)";

/**
 * POST/PUT body phone field — undefined/null/"" → null; non-empty must pass format check.
 */
export function parseOptionalPatientPhone(raw: unknown): PatientPhoneParseResult {
  if (raw === undefined || raw === null) return { ok: true, phone: null };
  if (typeof raw !== "string") return { ok: false, error: "Phone must be a string" };
  const normalized = normalizePhoneWhitespace(raw);
  if (!normalized) return { ok: true, phone: null };
  if (!isValidContactPhone(normalized)) {
    return { ok: false, error: INVALID_PHONE_MESSAGE };
  }
  return { ok: true, phone: normalized };
}

/** Client form guard before mutation — returns user-facing error or null when valid. */
export function validateOptionalPatientPhoneInput(
  raw: string | undefined | null
): string | null {
  const result = parseOptionalPatientPhone(raw ?? null);
  return result.ok ? null : result.error;
}
