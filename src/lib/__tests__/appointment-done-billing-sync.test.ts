import { describe, expect, it, vi, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  isAppointmentDoneTransition,
  syncInvoicesAfterAppointmentDone,
} from "@/lib/appointment-done-billing-sync";
import * as billingMap from "@/lib/billing-invoice-map";
import * as queryClientLib from "@/lib/query-client";
import * as crossTab from "@/lib/query-cache-cross-tab";
import type { InvoiceRow } from "@/lib/billing-types";

const draftInvoice = (): InvoiceRow => ({
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "doc-1",
  amount: 12_000,
  currency: "eur",
  status: "draft",
  created_at: "2026-06-02T10:00:00.000Z",
  payments: [],
  organization_id: "org-1",
});

describe("isAppointmentDoneTransition", () => {
  it("detects first transition to done", () => {
    expect(isAppointmentDoneTransition("pending", "done")).toBe(true);
    expect(isAppointmentDoneTransition("alert", "done")).toBe(true);
  });

  it("ignores repeat done or leaving done", () => {
    expect(isAppointmentDoneTransition("done", "done")).toBe(false);
    expect(isAppointmentDoneTransition("done", "pending")).toBe(false);
    expect(isAppointmentDoneTransition(undefined, "done")).toBe(true);
  });
});

describe("syncInvoicesAfterAppointmentDone", () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = new QueryClient();
    vi.restoreAllMocks();
  });

  it("merges auto-draft invoice and publishes cross-tab billing sync", async () => {
    const mergeSpy = vi.spyOn(billingMap, "mergeInvoiceIntoAllCaches");
    const syncSpy = vi
      .spyOn(queryClientLib, "syncInvoicesAfterWrite")
      .mockResolvedValue(undefined);
    const publishSpy = vi.spyOn(crossTab, "publishInvoiceMergeCrossTab");
    const row = draftInvoice();

    await syncInvoicesAfterAppointmentDone(qc, {
      appointmentId: "appt-1",
      patientId: "patient-1",
      previousStatus: "pending",
      nextStatus: "done",
      autoDraftInvoice: row,
    });

    expect(mergeSpy).toHaveBeenCalledWith(qc, row);
    expect(syncSpy).toHaveBeenCalledWith(
      qc,
      expect.objectContaining({
        invoiceId: row.id,
        patientId: "patient-1",
        scope: "billing",
        cachesMerged: true,
      })
    );
    expect(publishSpy).toHaveBeenCalledWith(row, {
      scope: "billing",
      patientId: "patient-1",
    });
  });

  it("invalidates invoices when done without inline auto-draft row", async () => {
    const invalidateSpy = vi
      .spyOn(queryClientLib, "invalidateInvoicesAndOverview")
      .mockResolvedValue(undefined);

    await syncInvoicesAfterAppointmentDone(qc, {
      appointmentId: "appt-1",
      patientId: "patient-1",
      previousStatus: "pending",
      nextStatus: "done",
    });

    expect(invalidateSpy).toHaveBeenCalledWith(qc, { patientId: "patient-1" });
  });

  it("no-ops when not done transition and no auto-draft", async () => {
    const invalidateSpy = vi
      .spyOn(queryClientLib, "invalidateInvoicesAndOverview")
      .mockResolvedValue(undefined);
    const mergeSpy = vi.spyOn(billingMap, "mergeInvoiceIntoAllCaches");

    await syncInvoicesAfterAppointmentDone(qc, {
      appointmentId: "appt-1",
      previousStatus: "pending",
      nextStatus: "alert",
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(mergeSpy).not.toHaveBeenCalled();
  });
});
