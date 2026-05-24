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
  { value: 1, shortLabel: "Routine Wellness", detail: "Preventive visits, no chronic burden." },
  { value: 2, shortLabel: "Low-Touch Follow-Up", detail: "Stable, infrequent check-ins." },
  { value: 3, shortLabel: "Mild Complexity", detail: "One stable condition or light coordination." },
  { value: 4, shortLabel: "Moderate Monitoring", detail: "Multiple meds or periodic labs." },
  { value: 5, shortLabel: "Enhanced Coordination", detail: "Several providers or social factors." },
  { value: 6, shortLabel: "Substantial Support", detail: "Frequent visits or care gaps to close." },
  { value: 7, shortLabel: "High Acuity", detail: "Serious conditions; proactive outreach." },
  { value: 8, shortLabel: "Complex Multi-System", detail: "Many diagnoses or fragile stability." },
  { value: 9, shortLabel: "Intensive Management", detail: "Near-weekly touch or high readmission risk." },
  { value: 10, shortLabel: "Critical / Continuous", detail: "Highest intensity; crisis-capable plan." },
] as const;

const stageByValue = new Map(PATIENT_CARE_LEVEL_STAGES.map((s) => [s.value, s]));

export function getPatientCareLevelLabel(level: number | null | undefined): string {
  if (level == null || Number.isNaN(level)) return "—";
  const s = stageByValue.get(level);
  return s ? `${level} — ${s.shortLabel}` : String(level);
}

/** Dropdown / compact rows — short tier label without em dash placeholder. */
export function getPatientCareLevelShortLabel(level: number | null | undefined): string {
  if (level == null || Number.isNaN(Number(level))) return "No tier set";
  const n = Number(level);
  const s = stageByValue.get(n);
  return s ? `${n} · ${s.shortLabel}` : `Tier ${n}`;
}
