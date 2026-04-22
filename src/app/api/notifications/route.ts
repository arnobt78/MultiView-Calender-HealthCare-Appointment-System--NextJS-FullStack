/**
 * Notifications API — GET, POST, PATCH
 * 
 * GET: List user's notifications (newest first, unread prioritized)
 * POST: Create a notification (internal/server use)
 * PATCH: Mark notification(s) as read
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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
    const body = await request.json();
    const { user_id, title, message, type, link } = body;

    if (!user_id || !title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, title, message, type" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        user_id,
        title,
        message,
        type,
        link: link || null,
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
    const { id, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { user_id: sessionUser.userId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (id) {
      const result = await prisma.notification.updateMany({
        where: { id, user_id: sessionUser.userId },
        data: { read: true },
      });
      return NextResponse.json({ success: true, updated: result.count });
    }

    return NextResponse.json(
      { error: "Provide 'id' or set 'markAllRead' to true" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
