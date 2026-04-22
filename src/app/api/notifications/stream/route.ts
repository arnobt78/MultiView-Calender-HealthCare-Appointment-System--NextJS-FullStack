/**
 * Server-Sent Events (SSE) endpoint for real-time notifications
 * 
 * GET /api/notifications/stream — long-lived SSE connection
 * Client should use EventSource API to connect.
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", userId: sessionUser.userId })}\n\n`)
      );

      // Poll for new notifications every 10 seconds
      let lastCheck = new Date();
      intervalId = setInterval(async () => {
        try {
          const newNotifications = await prisma.notification.findMany({
            where: {
              user_id: sessionUser.userId,
              created_at: { gt: lastCheck },
            },
            orderBy: { created_at: "desc" },
          });

          if (newNotifications.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "notifications", data: newNotifications })}\n\n`
              )
            );
            lastCheck = new Date();
          }

          // Send heartbeat
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (error) {
          console.error("SSE poll error:", error);
        }
      }, 10_000);
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
