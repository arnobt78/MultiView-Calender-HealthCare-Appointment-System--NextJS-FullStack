/**
 * Invitations API Route Handler
 * 
 * This file handles invitation management for the application:
 * - POST: Create and send new invitations (appointment or dashboard access)
 * - GET: Retrieve all invitations for the current user
 * 
 * Invitation System:
 * - Supports two types: "appointment" and "dashboard"
 * - Uses secure tokens (UUID) for invitation links
 * - Sends email notifications to invitees
 * - Tracks invitation status (pending, accepted, declined)
 */

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sendInvitationEmail } from "@/lib/email";
import { InvitationRequest } from "@/types/invitation";
import { query } from "@/lib/postgresClient";
import { getSessionUser } from "@/lib/session";

/**
 * POST /api/invitations
 * 
 * Creates a new invitation and sends it via email.
 * Supports two invitation types:
 * 1. "appointment" - Invite user to access a specific appointment
 * 2. "dashboard" - Invite user to access another user's dashboard
 * 
 * Request Body:
 * - type: "appointment" | "dashboard"
 * - email: Email address of the person being invited
 * - resourceId: ID of the appointment or dashboard owner
 * - permission: "read" | "write" | "full"
 * - invitedUserId: (optional) User ID if they already have an account
 * 
 * @param req - Next.js request containing invitation data
 * @returns JSON response with invitation token or error
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user from session
    // This ensures only logged-in users can send invitations
    const sessionUser = await getSessionUser();
    
    // Security: Require authentication
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = { id: sessionUser.userId, email: sessionUser.email };
    
    // Parse request body
    const body = (await req.json()) as InvitationRequest;
    const { type, email, resourceId, permission, invitedUserId } = body;
    
    // Input validation: Ensure all required fields are present
    if (!type || !email || !resourceId || !permission) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Generate unique invitation token
    // This token is used in the invitation link and stored in the database
    // UUID v4 provides cryptographically strong random tokens
    const token = uuidv4();
    // Debug log for insert values
    console.log("Inserting invitation:", {
      appointment: resourceId,
      invited_email: email,
      status: "pending",
      invitation_token: token,
      permission,
      created_at: new Date().toISOString(),
      invited_by: user.id,
    });
    // Save invitation to DB (appointment_assignee or dashboard_access)
    if (type === "appointment") {
      try {
        await query(
          `INSERT INTO appointment_assignee (appointment, "user", invited_email, status, invitation_token, permission, invited_by, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [resourceId, invitedUserId || null, email, "pending", token, permission, user.id]
        );
      } catch (error: any) {
        console.error("Insert error (appointment_assignee):", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (type === "dashboard") {
      try {
        await query(
          `INSERT INTO dashboard_access (owner_user_id, invited_user_id, invited_email, status, invitation_token, permission, invited_by, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [resourceId, invitedUserId || null, email, "pending", token, permission, user.id]
        );
      } catch (error: any) {
        console.error("Insert error (dashboard_access):", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Invalid invitation type" }, { status: 400 });
    }
    const link = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/accept-invitation?token=${token}`;
    await sendInvitationEmail({
      to: email,
      subject: `You are invited to access a ${type}`,
      html: `<p>You have been invited to access a ${type} with ${permission} permission.<br />Click <a href="${link}">here</a> to accept the invitation.</p>`
    });
    return NextResponse.json({ message: "Invitation sent", token });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
export async function GET(req: NextRequest) {
  // Auth required: get user from session
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const email = sessionUser.email;
  const userId = sessionUser.userId;
  
  // Get all appointment invitations where user is sender or receiver
  // Optimized query with single JOIN instead of two separate queries (reduces N+1 problem)
  const appointmentAssigneesResult = await query(
    `SELECT 
       aa.*,
       a.title as appointment_title
     FROM appointment_assignee aa
     LEFT JOIN appointments a ON aa.appointment = a.id
     WHERE aa."user" = $1 OR aa.invited_email = $2 OR aa.invited_by = $3
     ORDER BY aa.created_at DESC
     LIMIT 100`,
    [userId, email, userId]
  );
  
  // Map results to expected format
  const appointmentInvitations = appointmentAssigneesResult.rows.map((a: any) => ({
    ...a,
    appointment_title: a.appointment_title || "",
  }));
  
  // Get all dashboard invitations where user is sender or receiver
  const dashboardInvitationsResult = await query(
    `SELECT * FROM dashboard_access 
     WHERE invited_user_id = $1 OR invited_email = $2 OR invited_by = $3`,
    [userId, email, userId]
  );
  const dashboardInvitations = dashboardInvitationsResult.rows;
  
  return NextResponse.json({
    appointmentInvitations: appointmentInvitations || [],
    dashboardInvitations: dashboardInvitations || [],
  });
}
