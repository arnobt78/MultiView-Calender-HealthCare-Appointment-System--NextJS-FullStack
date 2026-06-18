import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAfterAppointmentMutation, syncAppointmentsAfterWrite } from "@/lib/query-client";

describe("invalidateAfterAppointmentMutation scope", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("status scope skips invoices.all invalidation", async () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries");
    await invalidateAfterAppointmentMutation(qc, {
      appointmentId: "appt-1",
      scope: "status",
    });
    const keys = spy.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).not.toContainEqual(queryKeys.invoices.all);
  });

  it("billing scope invalidates invoices.all", async () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries");
    await invalidateAfterAppointmentMutation(qc, {
      appointmentId: "appt-1",
      scope: "billing",
    });
    const keys = spy.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(queryKeys.invoices.all);
  });

  it("external path busts appointments.all via invalidateAfterAppointmentMutation", async () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries");
    await invalidateAfterAppointmentMutation(qc, {
      appointmentId: "appt-1",
      scope: "schedule",
    });
    const keys = spy.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(queryKeys.appointments.all);
  });

  it("syncAppointmentsAfterWrite with cachesMerged skips appointments.all", async () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries");
    await syncAppointmentsAfterWrite(qc, {
      appointmentId: "appt-1",
      scope: "schedule",
      cachesMerged: true,
    });
    const keys = spy.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).not.toContainEqual(queryKeys.appointments.all);
  });
});
