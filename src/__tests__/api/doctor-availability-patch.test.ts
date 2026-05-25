/**
 * PATCH /api/doctor-availability/[id] — RBAC + validation contract tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/session", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/rbac", () => ({
  getUserRole: vi.fn(),
  isAdminRole: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    doctorAvailability: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PATCH } from "@/app/api/doctor-availability/[id]/route";

const WINDOW_ID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const DOCTOR_ID = "550e8400-e29b-41d4-a716-446655440000";
const OTHER_ID = "660e8400-e29b-41d4-a716-446655440001";

const existingWindow = {
  id: WINDOW_ID,
  user_id: DOCTOR_ID,
  weekday: 1,
  start_min: 540,
  end_min: 1020,
  timezone: "Europe/Berlin",
};

beforeEach(() => {
  vi.mocked(getSessionUser).mockReset();
  vi.mocked(getUserRole).mockReset();
  vi.mocked(isAdminRole).mockReset();
  vi.mocked(prisma.doctorAvailability.findUnique).mockReset();
  vi.mocked(prisma.doctorAvailability.update).mockReset();
});

describe("PATCH /api/doctor-availability/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    const req = new NextRequest(`http://localhost/api/doctor-availability/${WINDOW_ID}`, {
      method: "PATCH",
      body: JSON.stringify({ start_min: 600 }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: WINDOW_ID }) });
    expect(res.status).toBe(401);
  });

  it("returns 403 when doctor patches another doctor window", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({ userId: OTHER_ID, email: "other@test.com" });
    vi.mocked(getUserRole).mockResolvedValue("doctor");
    vi.mocked(isAdminRole).mockReturnValue(false);
    vi.mocked(prisma.doctorAvailability.findUnique).mockResolvedValue(existingWindow as never);

    const req = new NextRequest(`http://localhost/api/doctor-availability/${WINDOW_ID}`, {
      method: "PATCH",
      body: JSON.stringify({ start_min: 600 }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: WINDOW_ID }) });
    expect(res.status).toBe(403);
  });

  it("updates window when doctor patches own schedule", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({ userId: DOCTOR_ID, email: "doc@test.com" });
    vi.mocked(getUserRole).mockResolvedValue("doctor");
    vi.mocked(isAdminRole).mockReturnValue(false);
    vi.mocked(prisma.doctorAvailability.findUnique).mockResolvedValue(existingWindow as never);
    vi.mocked(prisma.doctorAvailability.update).mockResolvedValue({
      ...existingWindow,
      start_min: 600,
    } as never);

    const req = new NextRequest(`http://localhost/api/doctor-availability/${WINDOW_ID}`, {
      method: "PATCH",
      body: JSON.stringify({ start_min: 600 }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: WINDOW_ID }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.availability.start_min).toBe(600);
  });
});
