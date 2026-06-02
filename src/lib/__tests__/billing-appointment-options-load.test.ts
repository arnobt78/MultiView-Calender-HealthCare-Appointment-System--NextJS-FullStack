import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: { findMany: vi.fn() },
    invoice: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { fetchBillingAppointmentOptions } from "@/lib/billing-appointment-options-load";

const ADMIN = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const APPT = "c40e5d58-6701-4ded-b085-d3cdaf62f9e3";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchBillingAppointmentOptions", () => {
  it("omits visits with paid invoice by default", async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      {
        id: APPT,
        title: "Visit",
        start: new Date("2026-06-01"),
        end: new Date("2026-06-01"),
        owner_id: ADMIN,
        patient: { firstname: "Demo", lastname: "Patient", email: "p@test.com" },
      },
    ] as never);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([
      {
        id: "inv-1",
        appointment_id: APPT,
        status: "paid",
        amount: 6900,
        currency: "eur",
        created_at: new Date(),
        payments: [{ status: "succeeded" }],
      },
    ] as never);

    const options = await fetchBillingAppointmentOptions({
      sessionUserId: ADMIN,
      role: "admin",
    });
    expect(options).toHaveLength(0);
  });

  it("includes blocked rows when includeBilled", async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      {
        id: APPT,
        title: "Visit",
        start: new Date("2026-06-01"),
        end: new Date("2026-06-01"),
        owner_id: ADMIN,
        patient: { firstname: "Demo", lastname: "Patient", email: "p@test.com" },
      },
    ] as never);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([
      {
        id: "inv-1",
        appointment_id: APPT,
        status: "paid",
        amount: 6900,
        currency: "eur",
        created_at: new Date(),
        payments: [{ status: "succeeded" }],
      },
    ] as never);

    const options = await fetchBillingAppointmentOptions({
      sessionUserId: ADMIN,
      role: "admin",
      includeBilled: true,
    });
    expect(options).toHaveLength(1);
    expect(options[0]?.eligible).toBe(false);
    expect(options[0]?.display_status).toBe("paid");
  });

  it("sets suggested_amount_cents for eligible visits from type price", async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      {
        id: APPT,
        title: "Visit",
        start: new Date("2026-06-01"),
        end: new Date("2026-06-01"),
        owner_id: ADMIN,
        treating_physician_id: ADMIN,
        patient: { firstname: "Demo", lastname: "Patient", email: "p@test.com" },
        appointment_type: { price_cents: 9250 },
        owner: { consultation_fee: 15000 },
        treating_physician: { consultation_fee: 15000 },
      },
    ] as never);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);

    const options = await fetchBillingAppointmentOptions({
      sessionUserId: ADMIN,
      role: "admin",
    });
    expect(options).toHaveLength(1);
    expect(options[0]?.suggested_amount_cents).toBe(9250);
  });
});
