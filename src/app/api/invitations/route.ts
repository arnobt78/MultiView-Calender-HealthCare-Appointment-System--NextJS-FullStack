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
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

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
    // Get authenticated user from session cookies
    // This ensures only logged-in users can send invitations
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    // Security: Require authentication
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
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
      const { data, error } = await supabaseAdmin.from("appointment_assignee").insert({
        appointment: resourceId,
        user: invitedUserId || null,
        invited_email: email,
        status: "pending",
        invitation_token: token,
        permission,
        created_at: new Date().toISOString(),
        invited_by: user.id,
      });
      console.log("Insert result (appointment_assignee):", { data, error });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (type === "dashboard") {
      const { data, error } = await supabaseAdmin.from("dashboard_access").insert({
        owner_user_id: resourceId,
        invited_user_id: invitedUserId || null,
        invited_email: email,
        status: "pending",
        invitation_token: token,
        permission,
        created_at: new Date().toISOString(),
        invited_by: user.id,
      });
      console.log("Insert result (dashboard_access):", { data, error });
      if (error) {
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
  // Auth required: get user from session (using cookies)
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Query both tables for invitations for this user (by email or user id)
  const email = user.email;
  const userId = user.id;
  // Get all appointment invitations where user is sender or receiver
  const { data: appointmentAssignees, error: appointmentError } = await supabaseAdmin
    .from("appointment_assignee")
    .select("*")
    .or(`user.eq.${userId},invited_email.eq.${email},invited_by.eq.${userId}`);

  // Fetch appointment titles for all unique appointment IDs
  const appointmentIds = Array.from(new Set((appointmentAssignees || []).map((a: any) => a.appointment).filter(Boolean)));
  let appointmentTitles: Record<string, string> = {};
  if (appointmentIds.length > 0) {
    const { data: appointmentsData } = await supabaseAdmin
      .from("appointments")
      .select("id, title")
      .in("id", appointmentIds);
    if (appointmentsData) {
      appointmentTitles = appointmentsData.reduce((acc: Record<string, string>, appt: any) => {
        acc[appt.id] = appt.title || "";
        return acc;
      }, {});
    }
  }

  // Attach title to each appointment invitation
  const appointmentInvitations = (appointmentAssignees || []).map((a: any) => ({
    ...a,
    appointment_title: appointmentTitles[a.appointment] || "",
  }));
  // Get all dashboard invitations where user is sender or receiver
  const { data: dashboardInvitations, error: dashboardError } = await supabaseAdmin
    .from("dashboard_access")
    .select("*")
    .or(`invited_user_id.eq.${userId},invited_email.eq.${email},invited_by.eq.${userId}`);
  return NextResponse.json({
    appointmentInvitations: appointmentInvitations || [],
    dashboardInvitations: dashboardInvitations || [],
  });
}
