import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: { findMany: vi.fn() },
    invoice: { findMany: vi.fn() },
    patient: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  enrichNotificationsWithLinkValidity,
  resolveNotificationLinkValid,
} from "@/lib/notification-link-validity";

const APPT_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const GONE_ID = "99999999-8888-4777-8666-555555555555";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.appointment.findMany).mockResolvedValue([{ id: APPT_ID }] as never);
  vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);
  vi.mocked(prisma.patient.findMany).mockResolvedValue([]);
});

describe("resolveNotificationLinkValid", () => {
  const appts = new Set([APPT_ID]);
  const invoices = new Set<string>();
  const patients = new Set<string>();

  it("returns false when link is missing", () => {
    expect(resolveNotificationLinkValid(null, appts, invoices, patients)).toBe(false);
  });

  it("returns true for static section routes", () => {
    expect(resolveNotificationLinkValid("/doctor-portal", appts, invoices, patients)).toBe(
      true
    );
  });

  it("returns true when appointment exists", () => {
    expect(
      resolveNotificationLinkValid(
        `/control-panel/appointments/${APPT_ID}`,
        appts,
        invoices,
        patients
      )
    ).toBe(true);
  });

  it("returns false when appointment was deleted", () => {
    expect(
      resolveNotificationLinkValid(
        `/appointments/${GONE_ID}`,
        appts,
        invoices,
        patients
      )
    ).toBe(false);
  });
});

describe("enrichNotificationsWithLinkValidity", () => {
  it("batch-enriches rows with link_valid", async () => {
    const rows = [
      {
        id: "n1",
        user_id: "u1",
        title: "A",
        message: "M",
        type: "info",
        read: false,
        created_at: new Date(),
        link: `/appointments/${APPT_ID}`,
      },
      {
        id: "n2",
        user_id: "u1",
        title: "B",
        message: "M",
        type: "info",
        read: true,
        created_at: new Date(),
        link: null,
      },
      {
        id: "n3",
        user_id: "u1",
        title: "C",
        message: "M",
        type: "info",
        read: true,
        created_at: new Date(),
        link: "/doctor-portal",
      },
    ];

    const enriched = await enrichNotificationsWithLinkValidity(rows);
    expect(enriched[0]?.link_valid).toBe(true);
    expect(enriched[1]?.link_valid).toBe(false);
    expect(enriched[2]?.link_valid).toBe(true);
    expect(prisma.appointment.findMany).toHaveBeenCalledOnce();
  });
});
