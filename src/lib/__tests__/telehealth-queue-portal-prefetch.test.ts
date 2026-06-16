import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  prefetchTelehealthQueuePortal,
  seedTelehealthQueuePortalCacheFromSsr,
} from "@/lib/telehealth-queue-portal-prefetch";

const mockBundle = {
  appointments: [{ id: "appt-1" }],
  patients: [{ id: "p1" }],
  categories: [{ id: "c1" }],
  assignees: [],
  dashboardAccessAccepted: [],
};

vi.mock("@/lib/server-prefetch", () => ({
  prefetchCalendarAppointmentsBundle: vi.fn(async () => mockBundle),
  prefetchDoctors: vi.fn(async () => ({ doctors: [{ id: "doc-1" }] })),
  prefetchInvoices: vi.fn(async () => [{ id: "inv-1", appointment_id: "appt-1" }]),
}));

describe("prefetchTelehealthQueuePortal", () => {
  it("fetches bundle, doctors, and invoices in parallel", async () => {
    const { prefetchInvoices } = await import("@/lib/server-prefetch");
    const result = await prefetchTelehealthQueuePortal("u1", "u@test.com", "doctor");
    expect(prefetchInvoices).toHaveBeenCalledWith("u1", "doctor", "u@test.com");
    expect(result.invoices).toEqual([{ id: "inv-1", appointment_id: "appt-1" }]);
    expect(result.doctorsDirectory).toEqual({ doctors: [{ id: "doc-1" }] });
    expect(result.appointments).toEqual(mockBundle.appointments);
  });
});

describe("seedTelehealthQueuePortalCacheFromSsr", () => {
  it("seeds invoices.all alongside appointments bundle", async () => {
    const qc = new QueryClient();
    const payload = await prefetchTelehealthQueuePortal("u1", "u@test.com", "patient");
    seedTelehealthQueuePortalCacheFromSsr(qc, payload);
    expect(qc.getQueryData(queryKeys.invoices.all)).toEqual(payload.invoices);
    expect(qc.getQueryData(queryKeys.appointments.all)).toEqual(mockBundle.appointments);
    expect(qc.getQueryData(queryKeys.doctors.all)).toEqual(payload.doctorsDirectory);
  });
});
