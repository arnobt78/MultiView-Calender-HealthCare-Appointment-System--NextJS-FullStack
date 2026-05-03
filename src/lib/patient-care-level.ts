/**
 * Clinical-style acuity tiers (1–10) stored as `patients.care_level` — higher = more coordination / risk.
 * Used by selects and analytics; keep labels clinician-friendly but short for UI.
 */
export type PatientCareLevelStage = {
  value: number;
  shortLabel: string;
  /** Longer hint for tooltips / help text */
  detail: string;
};

export const PATIENT_CARE_LEVEL_STAGES: readonly PatientCareLevelStage[] = [
  { value: 1, shortLabel: "Routine wellness", detail: "Preventive visits, no chronic burden." },
  { value: 2, shortLabel: "Low-touch follow-up", detail: "Stable, infrequent check-ins." },
  { value: 3, shortLabel: "Mild complexity", detail: "One stable condition or light coordination." },
  { value: 4, shortLabel: "Moderate monitoring", detail: "Multiple meds or periodic labs." },
  { value: 5, shortLabel: "Enhanced coordination", detail: "Several providers or social factors." },
  { value: 6, shortLabel: "Substantial support", detail: "Frequent visits or care gaps to close." },
  { value: 7, shortLabel: "High acuity", detail: "Serious conditions; proactive outreach." },
  { value: 8, shortLabel: "Complex multi-system", detail: "Many diagnoses or fragile stability." },
  { value: 9, shortLabel: "Intensive management", detail: "Near-weekly touch or high readmission risk." },
  { value: 10, shortLabel: "Critical / continuous", detail: "Highest intensity; crisis-capable plan." },
] as const;

const stageByValue = new Map(PATIENT_CARE_LEVEL_STAGES.map((s) => [s.value, s]));

export function getPatientCareLevelLabel(level: number | null | undefined): string {
  if (level == null || Number.isNaN(level)) return "—";
  const s = stageByValue.get(level);
  return s ? `${level} — ${s.shortLabel}` : String(level);
}
