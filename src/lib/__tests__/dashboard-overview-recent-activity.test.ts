import { describe, expect, it } from "vitest";
import {
  pickRecentActivityAppointments,
  resolveAppointmentActivityKind,
} from "@/lib/dashboard-overview-recent-activity";

describe("dashboard-overview-recent-activity", () => {
  it("classifies updated when updated_at is after created_at", () => {
    expect(
      resolveAppointmentActivityKind({
        created_at: new Date("2026-05-28T10:00:00Z"),
        updated_at: new Date("2026-05-29T10:00:00Z"),
      })
    ).toBe("updated");
  });

  it("sorts by latest activity and takes limit", () => {
    const rows = [
      {
        id: "a",
        created_at: new Date("2026-05-20T10:00:00Z"),
        updated_at: new Date("2026-05-25T10:00:00Z"),
      },
      {
        id: "b",
        created_at: new Date("2026-05-29T08:00:00Z"),
        updated_at: null,
      },
    ];
    const picked = pickRecentActivityAppointments(rows, 1);
    expect(picked[0]?.id).toBe("b");
  });
});
