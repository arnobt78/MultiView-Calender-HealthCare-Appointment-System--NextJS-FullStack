/**
 * Possessive snapshot section titles on entity detail pages — "{Entity}'s {Section}".
 * Reuse on patient/category/appointment/doctor detail tables as snapshot blocks roll out.
 */

export const ENTITY_DETAIL_SNAPSHOT_SECTION_LABELS = {
  relatedAppointments: "Related Appointments",
  relatedInvoicesViaAppointments: "Related Invoices (Via Appointments)",
  relatedPeople: "Related People",
  relatedBilling: "Related Billing",
  assignedPatients: "Assigned Patients",
  linkedVisit: "Linked Visit",
  paymentHistory: "Payment History",
} as const;

export type EntityDetailSnapshotSectionLabelKey = keyof typeof ENTITY_DETAIL_SNAPSHOT_SECTION_LABELS;

/** Fallback owner noun when live entity name is blank or placeholder during hydrate. */
export type EntityDetailSnapshotEntityKind = "patient" | "category" | "appointment" | "doctor";

const ENTITY_KIND_FALLBACK: Record<EntityDetailSnapshotEntityKind, string> = {
  patient: "Patient",
  category: "Category",
  appointment: "Appointment",
  doctor: "Doctor",
};

const PLACEHOLDER_NAMES = new Set(["—", "-", ""]);

function resolveEntityOwnerName(
  entityName: string | null | undefined,
  entityKind: EntityDetailSnapshotEntityKind
): string {
  const trimmed = entityName?.trim() ?? "";
  if (PLACEHOLDER_NAMES.has(trimmed)) {
    return ENTITY_KIND_FALLBACK[entityKind];
  }
  return trimmed;
}

/**
 * Builds "{EntityName}'s Related Appointments" (and sibling section labels).
 * Keeps copy centralized for CP + portal entity detail snapshot headings.
 */
export function entityDetailOwnedSnapshotSectionTitle(
  entityName: string | null | undefined,
  section: EntityDetailSnapshotSectionLabelKey,
  entityKind: EntityDetailSnapshotEntityKind
): string {
  const owner = resolveEntityOwnerName(entityName, entityKind);
  return `${owner}'s ${ENTITY_DETAIL_SNAPSHOT_SECTION_LABELS[section]}`;
}
