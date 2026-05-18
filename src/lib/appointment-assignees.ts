import type { AppointmentAssignee } from "@/types/types";

/**
 * One row per user|invited_email for an appointment.
 * Prefers accepted over pending; on tie, higher permission (full > write > read).
 */
export function dedupeAssignees(
  assignees: AppointmentAssignee[],
  appointmentId: string
): AppointmentAssignee[] {
  const filteredAssignees = assignees.filter((ass) => ass.appointment === appointmentId);
  const dedupedMap = new Map<string, AppointmentAssignee>();
  for (const ass of filteredAssignees) {
    const key = `${ass.user || ""}|${ass.invited_email || ""}`;
    if (!dedupedMap.has(key)) {
      dedupedMap.set(key, ass);
    } else {
      const prev = dedupedMap.get(key)!;
      const statusOrder: Record<string, number> = { accepted: 2, pending: 1, declined: 0 };
      const permOrder: Record<string, number> = { full: 3, write: 2, read: 1 };
      const prevStatus =
        typeof prev.status === "string" && statusOrder[prev.status] !== undefined
          ? statusOrder[prev.status]
          : 0;
      const currStatus =
        typeof ass.status === "string" && statusOrder[ass.status] !== undefined
          ? statusOrder[ass.status]
          : 0;
      const prevPerm =
        typeof prev.permission === "string" && permOrder[prev.permission] !== undefined
          ? permOrder[prev.permission]
          : 0;
      const currPerm =
        typeof ass.permission === "string" && permOrder[ass.permission] !== undefined
          ? permOrder[ass.permission]
          : 0;
      if (currStatus > prevStatus || (currStatus === prevStatus && currPerm > prevPerm)) {
        dedupedMap.set(key, ass);
      }
    }
  }
  return Array.from(dedupedMap.values());
}
