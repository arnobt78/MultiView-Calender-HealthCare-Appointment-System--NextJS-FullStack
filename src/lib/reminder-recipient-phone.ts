/**
 * SMS phone resolution for reminder cron — linked user first, then patient record.
 */

type PatientUserPhone = { phone?: string | null } | null | undefined;
type PatientRecordPhone = { phone?: string | null } | null | undefined;

/** E.164 or local — prefer auth user.phone, fall back to patients.phone. */
export function resolveReminderSmsPhone(opts: {
  patientUser?: PatientUserPhone;
  patientRecord?: PatientRecordPhone;
}): string | null {
  const fromUser = opts.patientUser?.phone?.trim();
  if (fromUser) return fromUser;
  const fromPatient = opts.patientRecord?.phone?.trim();
  return fromPatient || null;
}
