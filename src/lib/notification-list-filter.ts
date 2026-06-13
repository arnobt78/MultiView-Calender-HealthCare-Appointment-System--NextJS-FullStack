/**
 * Pure filter helpers for CP notifications toolbar — uses enriched `link_valid`
 * so stale deep-links (entity deleted) do not match "Navigable".
 */

import type { NotificationLinkFilter } from "@/lib/notification-filter-presets";
import type { Notification } from "@/types/notification";

/** True when a row passes the link filter chip (all / navigable / not navigable). */
export function matchesNotificationLinkFilter(
  n: Pick<Notification, "link" | "link_valid">,
  filter: NotificationLinkFilter
): boolean {
  if (filter === "all") return true;
  if (filter === "has_link") return n.link_valid === true;
  // no_link — null link, stale false, or not yet enriched (undefined)
  return n.link_valid !== true;
}
