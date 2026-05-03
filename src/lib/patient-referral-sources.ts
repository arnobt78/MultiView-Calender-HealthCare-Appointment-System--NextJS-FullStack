/** Referral / intake channel — stored inside `clinical_profile` JSON (no extra DB columns). */
export const PATIENT_REFERRAL_SOURCES = [
  { value: "control_panel", label: "Control Panel (Staff)" },
  { value: "patient_portal", label: "Patient Portal" },
  { value: "external_partner", label: "External Clinic / Partner" },
  { value: "other", label: "Other — Describe Below" },
] as const;
