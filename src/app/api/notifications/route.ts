/**
 * Notifications API — GET, POST, PATCH
 * 
 * GET: List user's notifications (newest first, unread prioritized)
 * POST: Create a notification (internal/server use)
 * PATCH: Mark notification(s) as read
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { user_id: sessionUser.userId },
        orderBy: [{ read: "asc" }, { created_at: "desc" }],
        take: 50,
      }),
      prisma.notification.count({
        where: { user_id: sessionUser.userId },
      }),
      prisma.notification.count({
        where: { user_id: sessionUser.userId, read: false },
      }),
    ]);

    return NextResponse.json({ notifications, total, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require session — user_id is derived from the session, not the body,
    // so a caller cannot create notifications for arbitrary users.
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as { title?: unknown; message?: unknown; type?: unknown; link?: unknown };
    const { title, message, type, link } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields: title, message, type" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        // Always use the authenticated session user — never trust client-supplied user_id.
        user_id: sessionUser.userId,
        title: String(title),
        message: String(message),
        type: String(type),
        link: link ? String(link) : null,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, markAllRead, deleteRead } = body;

    if (markAllRead === true) {
      await prisma.notification.updateMany({
        where: { user_id: sessionUser.userId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    /*
     * Delete only read notifications (safe default).
     * This keeps unread items intact while letting users clean up log noise.
     */
    if (deleteRead === true) {
      const result = await prisma.notification.deleteMany({
        where: { user_id: sessionUser.userId, read: true },
      });
      return NextResponse.json({ success: true, deleted: result.count });
    }

    if (typeof id === "string" && isValidUUID(id)) {
      const result = await prisma.notification.updateMany({
        where: { id, user_id: sessionUser.userId },
        data: { read: true },
      });
      return NextResponse.json({ success: true, updated: result.count });
    }

    return NextResponse.json(
      { error: "Provide a valid 'id' or set 'markAllRead' to true" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
