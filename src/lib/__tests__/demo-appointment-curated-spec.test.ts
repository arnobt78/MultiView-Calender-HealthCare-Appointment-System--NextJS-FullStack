import { describe, expect, it } from "vitest";
import {
  DEMO_CURATED_ADMIN_EMAIL,
  DEMO_CURATED_ROWS,
  resolveCuratedSlot,
} from "../../../scripts/lib/demo-appointment-curated-spec";

describe("demo-appointment-curated-spec", () => {
  it("defines exactly 10 curated rows", () => {
    expect(DEMO_CURATED_ROWS).toHaveLength(10);
  });

  it("includes exactly one visit-cancelled row", () => {
    const cancelled = DEMO_CURATED_ROWS.filter((r) => r.status === "cancelled");
    expect(cancelled).toHaveLength(1);
    expect(cancelled[0]?.titleSuffix).toContain("visit-cancelled");
  });

  it("includes doctor-owner pending/alert rows for cancel QA", () => {
    const doctorOwner = DEMO_CURATED_ROWS.filter(
      (r) =>
        r.ownerEmail === "test@doctor.com" &&
        (r.status === "pending" || r.status === "alert")
    );
    expect(doctorOwner.length).toBeGreaterThanOrEqual(2);
  });

  it("resolveCuratedSlot returns end after start", () => {
    const { start, end } = resolveCuratedSlot(0, 10, 30);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });

  it("cancelled row specifies admin as canceller by default", () => {
    const row = DEMO_CURATED_ROWS.find((r) => r.status === "cancelled");
    expect(row?.cancelledByEmail ?? DEMO_CURATED_ADMIN_EMAIL).toBe(
      DEMO_CURATED_ADMIN_EMAIL
    );
  });
});
