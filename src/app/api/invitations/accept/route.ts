import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token, userId } = await req.json();
    if (!token || !userId) {
      return NextResponse.json({ error: "Missing token or userId" }, { status: 400 });
    }

    const appointmentUpdated = await prisma.appointmentAssignee.updateMany({
      where: { invitation_token: token, status: "pending" },
      data: { status: "accepted", user_id: userId },
    });

    if (appointmentUpdated.count > 0) {
      return NextResponse.json({ message: "Appointment invitation accepted" });
    }

    const dashboardUpdated = await prisma.dashboardAccess.updateMany({
      where: { invitation_token: token, status: "pending" },
      data: { status: "accepted", invited_user_id: userId },
    });

    if (dashboardUpdated.count > 0) {
      return NextResponse.json({ message: "Dashboard invitation accepted" });
    }

    return NextResponse.json({ error: "Invalid or already accepted invitation" }, { status: 404 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
