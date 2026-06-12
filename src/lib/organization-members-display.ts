/**
 * Organization detail Members section — possessive title + subtitle (billing panel parity).
 */

import { entityDetailOwnedSnapshotSectionTitle } from "@/lib/entity-detail-snapshot-section-copy";

/** Muted subtitle under stacked header — org-scoped membership role counts. */
export const ORGANIZATION_MEMBERS_SUBTITLE =
  "Portal users linked to this organisation — counts by membership role (admin, doctor, patient)";

/** Panel title — possessive when organisation display name is known. */
export function organizationMembersSectionTitle(
  orgName: string | null | undefined
): string {
  return entityDetailOwnedSnapshotSectionTitle(orgName, "members", "organization");
}
