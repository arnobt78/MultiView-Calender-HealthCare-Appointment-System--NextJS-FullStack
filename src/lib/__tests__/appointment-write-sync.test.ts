import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { syncAppointmentsAfterWrite } from "@/lib/query-client";

describe("syncAppointmentsAfterWrite", () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient();
    vi.restoreAllMocks();
  });

  it("skips appointments.all invalidation when cachesMerged", async () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");
    await syncAppointmentsAfterWrite(qc, {
      appointmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      scope: "schedule",
      cachesMerged: true,
    });
    const keys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).not.toContainEqual(queryKeys.appointments.all);
    expect(keys).not.toContainEqual(
      queryKeys.appointments.detail("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
    );
    expect(keys).toContainEqual(queryKeys.notifications.all);
  });

  it("invalidates appointments.all when cachesMerged is false", async () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");
    await syncAppointmentsAfterWrite(qc, {
      appointmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      scope: "status",
      cachesMerged: false,
    });
    const keys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(queryKeys.appointments.all);
  });
});
