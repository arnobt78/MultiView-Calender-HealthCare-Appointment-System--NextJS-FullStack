/**
 * Telehealth queue schedule panel — empty copy per date filter tab.
 */

import type { TelehealthQueueDateFilter } from "@/lib/telehealth-queue-filter";

export type TelehealthQueueEmptyCopy = {
  title: string;
  subtitle: string;
};

/** Title + subtitle for schedule list when filter returns zero telehealth visits. */
export function buildTelehealthQueueEmptyCopy(
  dateFilter: TelehealthQueueDateFilter
): TelehealthQueueEmptyCopy {
  if (dateFilter === "today") {
    return {
      title: "No telehealth visits today",
      subtitle: "Video sessions scheduled for today will appear here.",
    };
  }
  if (dateFilter === "upcoming") {
    return {
      title: "No upcoming telehealth visits",
      subtitle: "Future video sessions will appear in this queue.",
    };
  }
  return {
    title: "No telehealth visits on record",
    subtitle: "All-time telehealth sessions will list here when scheduled.",
  };
}
