import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  NOTIFICATION_STALE_SUFFIX,
  clearStaleNotificationLinksForEntity,
} from "@/lib/notification-link";

const APPT_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("clearStaleNotificationLinksForEntity", () => {
  it("nulls links and suffixes messages for matching rows", async () => {
    vi.mocked(prisma.notification.findMany).mockResolvedValue([
      { id: "n1", message: "Appointment updated" },
    ] as never);
    vi.mocked(prisma.notification.update).mockResolvedValue({} as never);

    const count = await clearStaleNotificationLinksForEntity("appointment", APPT_ID);

    expect(count).toBe(1);
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: "n1" },
      data: {
        link: null,
        message: `Appointment updated${NOTIFICATION_STALE_SUFFIX}`,
      },
    });
  });

  it("returns 0 when no rows match", async () => {
    vi.mocked(prisma.notification.findMany).mockResolvedValue([]);

    const count = await clearStaleNotificationLinksForEntity("appointment", APPT_ID);

    expect(count).toBe(0);
    expect(prisma.notification.update).not.toHaveBeenCalled();
  });
});
