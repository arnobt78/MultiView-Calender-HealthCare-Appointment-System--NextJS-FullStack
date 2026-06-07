/**
 * Reminder cron query helpers — unit-tested without hitting the route handler.
 */

export type ReminderCandidateFilter = {
  now: Date;
  in24Hours: Date;
};

/** Prisma `where` clause for appointments due a 24h reminder batch. */
export function buildReminderCandidatesWhere(filter: ReminderCandidateFilter) {
  return {
    start: {
      gte: filter.now,
      lte: filter.in24Hours,
    },
    status: {
      notIn: ["done", "cancelled"] as string[],
    },
    reminder_sent_at: null,
  };
}
