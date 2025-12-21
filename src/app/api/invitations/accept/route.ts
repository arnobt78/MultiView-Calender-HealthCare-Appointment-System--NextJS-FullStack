import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";

// POST /api/invitations/accept - Accept invitation by token
export async function POST(req: NextRequest) {
  try {
    const { token, userId } = await req.json();
    if (!token || !userId) {
      return NextResponse.json({ error: "Missing token or userId" }, { status: 400 });
    }
    
    // Try appointment_assignee first
    const appointmentResult = await query(
      `UPDATE appointment_assignee 
       SET status = 'accepted', "user" = $1 
       WHERE invitation_token = $2 AND status = 'pending'
       RETURNING id`,
      [userId, token]
    );
    
    if (appointmentResult.rows.length > 0) {
      return NextResponse.json({ message: "Appointment invitation accepted" });
    }
    
    // Try dashboard_access
    const dashboardResult = await query(
      `UPDATE dashboard_access 
       SET status = 'accepted', invited_user_id = $1 
       WHERE invitation_token = $2 AND status = 'pending'
       RETURNING id`,
      [userId, token]
    );
    
    if (dashboardResult.rows.length > 0) {
      return NextResponse.json({ message: "Dashboard invitation accepted" });
    }
    
    return NextResponse.json({ error: "Invalid or already accepted invitation" }, { status: 404 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
