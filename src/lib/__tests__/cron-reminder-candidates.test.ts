import { describe, it, expect } from "vitest";
import { buildReminderCandidatesWhere } from "@/lib/cron-reminder-candidates";

describe("buildReminderCandidatesWhere", () => {
  it("excludes done/cancelled and dedupes via reminder_sent_at", () => {
    const now = new Date("2026-06-07T07:00:00.000Z");
    const in24Hours = new Date("2026-06-08T07:00:00.000Z");
    expect(buildReminderCandidatesWhere({ now, in24Hours })).toEqual({
      start: { gte: now, lte: in24Hours },
      status: { notIn: ["done", "cancelled"] },
      reminder_sent_at: null,
    });
  });
});
