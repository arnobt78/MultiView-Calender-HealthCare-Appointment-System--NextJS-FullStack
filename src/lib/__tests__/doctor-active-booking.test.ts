import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  assertDoctorActiveForBooking,
  assertDoctorActiveForBookingUnlessCurrent,
  InactiveDoctorBookingError,
} from "@/lib/doctor-active-booking";

describe("doctor-active-booking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("assertDoctorActiveForBooking rejects inactive doctors", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      role: "doctor",
      is_active: false,
    } as never);

    await expect(assertDoctorActiveForBooking("doc-id")).rejects.toBeInstanceOf(
      InactiveDoctorBookingError
    );
  });

  it("assertDoctorActiveForBookingUnlessCurrent skips when id unchanged", async () => {
    await assertDoctorActiveForBookingUnlessCurrent("doc-id", "doc-id");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("assertDoctorActiveForBookingUnlessCurrent validates when id changes", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      role: "doctor",
      is_active: true,
    } as never);

    await assertDoctorActiveForBookingUnlessCurrent("new-doc", "old-doc");
    expect(prisma.user.findUnique).toHaveBeenCalled();
  });
});
