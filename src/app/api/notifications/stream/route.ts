/**
 * Server-Sent Events (SSE) endpoint for real-time notifications
 *
 * GET /api/notifications/stream — long-lived SSE connection
 * Client should use EventSource API to connect.
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  enrichNotificationsWithLinkValidity,
} from "@/lib/notification-link-validity";
import { serializeNotificationRow } from "@/lib/serialize-notification-row";
import {
  createSafeSseEnqueue,
  encodeSseData,
  encodeSseError,
  encodeSseHeartbeat,
} from "@/lib/notification-stream-sse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLL_MS = 10_000;

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let intervalId: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const safe = createSafeSseEnqueue(controller, () => {
        if (intervalId) clearInterval(intervalId);
      });

      safe.enqueue(
        encodeSseData({ type: "connected", userId: sessionUser.userId })
      );

      let lastCheck = new Date();

      const stop = () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = undefined;
        }
        safe.close();
      };

      request.signal.addEventListener("abort", stop, { once: true });

      intervalId = setInterval(async () => {
        if (safe.isClosed()) {
          stop();
          return;
        }

        try {
          const newNotifications = await prisma.notification.findMany({
            where: {
              user_id: sessionUser.userId,
              created_at: { gt: lastCheck },
            },
            orderBy: { created_at: "desc" },
          });

          if (safe.isClosed()) return;

          if (newNotifications.length > 0) {
            const enriched = await enrichNotificationsWithLinkValidity(newNotifications);
            safe.enqueue(
              encodeSseData({
                type: "notifications",
                data: enriched.map(serializeNotificationRow),
              })
            );
            lastCheck = new Date();
          }

          safe.enqueue(encodeSseHeartbeat());
        } catch (error: unknown) {
          const code =
            error &&
            typeof error === "object" &&
            "code" in error &&
            typeof (error as { code: unknown }).code === "string"
              ? (error as { code: string }).code
              : undefined;

          if (!safe.isClosed()) {
            safe.enqueue(
              encodeSseError(
                error instanceof Error ? error.message : "SSE poll failed",
                code
              )
            );
          }

          console.error("SSE poll error:", error);
          stop();
        }
      }, POLL_MS);
    },
    cancel() {
      if (intervalId) clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
