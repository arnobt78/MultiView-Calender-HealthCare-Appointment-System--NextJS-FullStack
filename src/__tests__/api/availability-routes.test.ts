/**
 * Contract tests for availability API route handlers (no Next server).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/session", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

vi.mock("@/lib/scheduling/availability-slot-grid", () => ({
  getBookableDatesInMonth: vi.fn(),
}));

vi.mock("@/lib/availability-slots", () => ({
  computeAvailabilitySlots: vi.fn(),
}));

import { getSessionUser } from "@/lib/session";
import { getBookableDatesInMonth } from "@/lib/scheduling/availability-slot-grid";
import { computeAvailabilitySlots } from "@/lib/availability-slots";
import { GET as GETDates } from "@/app/api/availability/dates/route";
import { GET as GETSlots } from "@/app/api/availability/slots/route";

const DOCTOR = "550e8400-e29b-41d4-a716-446655440000";
const TYPE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

beforeEach(() => {
  vi.mocked(getSessionUser).mockReset();
  vi.mocked(getBookableDatesInMonth).mockReset();
  vi.mocked(computeAvailabilitySlots).mockReset();
});

describe("GET /api/availability/dates", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    const req = new NextRequest(
      `http://localhost/api/availability/dates?doctorId=${DOCTOR}&typeId=${TYPE}&month=2026-05`
    );
    const res = await GETDates(req);
    expect(res.status).toBe(401);
  });

  it("returns month days when authenticated", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: "user-1",
      email: "a@b.com",
    });
    vi.mocked(getBookableDatesInMonth).mockResolvedValue({
      days: [{ date: "2026-05-25", status: "open" }],
      timezone: "UTC",
    });

    const req = new NextRequest(
      `http://localhost/api/availability/dates?doctorId=${DOCTOR}&typeId=${TYPE}&month=2026-05`
    );
    const res = await GETDates(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.days).toHaveLength(1);
    expect(body.timezone).toBe("UTC");
  });

  it("returns 400 for missing scope", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: "user-1",
      email: "a@b.com",
    });
    const req = new NextRequest(
      `http://localhost/api/availability/dates?doctorId=${DOCTOR}&month=2026-05`
    );
    const res = await GETDates(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/availability/slots", () => {
  it("returns slots and cells when authenticated", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: "user-1",
      email: "a@b.com",
    });
    vi.mocked(computeAvailabilitySlots).mockResolvedValue({
      slots: ["2026-05-25T09:00:00.000Z"],
      cells: [{ start: "2026-05-25T09:00:00.000Z", status: "available" }],
      timezone: "UTC",
    });

    const req = new NextRequest(
      `http://localhost/api/availability/slots?doctorId=${DOCTOR}&typeId=${TYPE}&date=2026-05-25`
    );
    const res = await GETSlots(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slots).toHaveLength(1);
    expect(body.cells).toHaveLength(1);
    expect(body.timezone).toBe("UTC");
  });
});
