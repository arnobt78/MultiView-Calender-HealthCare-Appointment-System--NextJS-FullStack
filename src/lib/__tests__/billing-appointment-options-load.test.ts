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

  it("uses default doctor visit fee when type and doctor fees are unset", async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      {
        id: APPT,
        title: "Visit",
        start: new Date("2026-06-01"),
        end: new Date("2026-06-01"),
        owner_id: ADMIN,
        treating_physician_id: ADMIN,
        patient: { firstname: "Demo", lastname: "Patient", email: "p@test.com" },
        appointment_type: { price_cents: 0, name: "Follow-up" },
        owner: { consultation_fee: 0 },
        treating_physician: { consultation_fee: 0 },
      },
    ] as never);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);

    const options = await fetchBillingAppointmentOptions({
      sessionUserId: ADMIN,
      role: "admin",
    });
    expect(options[0]?.suggested_amount_cents).toBe(15000);
  });

  it("includes rich visit display fields for picker cards", async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      {
        id: APPT,
        title: "Demo curated",
        start: new Date("2026-08-01T10:00:00Z"),
        end: new Date("2026-08-01T10:30:00Z"),
        location: "Room 1",
        is_telehealth: false,
        owner_id: ADMIN,
        treating_physician_id: ADMIN,
        category: { id: "cat-1", label: "General", color: "#3b82f6", icon: null },
        appointment_type: { name: "Follow-up", price_cents: 9250 },
        patient: {
          id: "pat-1",
          firstname: "Anya",
          lastname: "Petrov",
          email: "anya@test.com",
          birth_date: new Date("1990-01-15"),
          care_level: 3,
          clinical_profile: { image_url: "demo/anya" },
        },
        owner: {
          id: ADMIN,
          display_name: "Demo Doctor",
          email: "doc@test.com",
          specialty: "Internal Medicine",
          consultation_fee: 15000,
        },
        treating_physician: {
          id: ADMIN,
          display_name: "Demo Doctor",
          email: "doc@test.com",
          specialty: "Internal Medicine",
          consultation_fee: 15000,
        },
      },
    ] as never);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);

    const options = await fetchBillingAppointmentOptions({
      sessionUserId: ADMIN,
      role: "admin",
    });
    expect(options[0]?.patient_id).toBe("pat-1");
    expect(options[0]?.when_label).toMatch(/Aug/);
    expect(options[0]?.category_label).toBe("General");
    expect(options[0]?.appointment_type_name).toBe("Follow-up");
    expect(options[0]?.treating_physician_label).toBe("Demo Doctor");
  });
});
