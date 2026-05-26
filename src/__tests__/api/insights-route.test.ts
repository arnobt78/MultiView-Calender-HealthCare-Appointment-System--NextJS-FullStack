/**
 * Contract tests for GET /api/insights (mocked session + data layer).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/session", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/rbac", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rbac")>();
  return {
    ...actual,
    getUserRole: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/insights-data", () => ({
  getInsightsData: vi.fn(),
}));

import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getInsightsData } from "@/lib/insights-data";
import { GET } from "@/app/api/insights/route";

const DOCTOR = "550e8400-e29b-41d4-a716-446655440000";
const OTHER_DOCTOR = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const ADMIN = "7c9e6679-7425-40de-944b-e07fc1f90ae7";

const mockPayload = { overview: { total: 3 } };

beforeEach(() => {
  vi.mocked(getSessionUser).mockReset();
  vi.mocked(getUserRole).mockReset();
  vi.mocked(prisma.user.findUnique).mockReset();
  vi.mocked(getInsightsData).mockReset();
  vi.mocked(getInsightsData).mockResolvedValue(mockPayload as never);
});

describe("GET /api/insights", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost/api/insights"));
    expect(res.status).toBe(401);
  });

  it("returns 403 for patient role", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: "patient-1",
      email: "p@test.com",
    });
    vi.mocked(getUserRole).mockResolvedValue("patient");
    const res = await GET(new NextRequest("http://localhost/api/insights"));
    expect(res.status).toBe(403);
  });

  it("returns 200 for doctor personal scope", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: DOCTOR,
      email: "doc@test.com",
    });
    vi.mocked(getUserRole).mockResolvedValue("doctor");
    const res = await GET(
      new NextRequest(
        "http://localhost/api/insights?scope=personal&period=month"
      )
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.overview.total).toBe(3);
    expect(getInsightsData).toHaveBeenCalled();
  });

  it("returns 403 when doctor requests another doctorId", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: DOCTOR,
      email: "doc@test.com",
    });
    vi.mocked(getUserRole).mockResolvedValue("doctor");
    const res = await GET(
      new NextRequest(
        `http://localhost/api/insights?scope=personal&period=month&doctorId=${OTHER_DOCTOR}`
      )
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid doctorId UUID", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: ADMIN,
      email: "admin@test.com",
    });
    vi.mocked(getUserRole).mockResolvedValue("admin");
    const res = await GET(
      new NextRequest(
        "http://localhost/api/insights?scope=organization&doctorId=not-a-uuid"
      )
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 for admin with valid doctorId", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: ADMIN,
      email: "admin@test.com",
    });
    vi.mocked(getUserRole).mockResolvedValue("admin");
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "doctor" } as never);
    const res = await GET(
      new NextRequest(
        `http://localhost/api/insights?scope=organization&doctorId=${DOCTOR}&period=month`
      )
    );
    expect(res.status).toBe(200);
    expect(prisma.user.findUnique).toHaveBeenCalled();
  });
});
