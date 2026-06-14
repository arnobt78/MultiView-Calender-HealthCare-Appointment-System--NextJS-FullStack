/**
 * CP notifications + navbar — navigability from enriched `link_valid` (C34).
 * Used by table content cell, actions menu, and optional navbar DRY.
 */

import type { Notification } from "@/types/notification";

/** True when UI may navigate to a detail page or external URL. */
export function canNavigateNotification(
  n: Pick<Notification, "link" | "link_valid">
): boolean {
  return n.link_valid === true && Boolean(n.link?.trim());
}

/** Count of actionable dropdown items (mark read + open link). */
export function notificationRowActionCount(
  n: Pick<Notification, "link" | "link_valid" | "read">
): number {
  let count = 0;
  if (!n.read) count += 1;
  if (canNavigateNotification(n)) count += 1;
  return count;
}
