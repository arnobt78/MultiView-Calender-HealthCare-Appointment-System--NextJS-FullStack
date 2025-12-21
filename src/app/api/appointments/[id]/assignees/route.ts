/**
 * Appointment Assignees by Appointment ID API Route Handler
 * 
 * This file implements RESTful API endpoints for managing assignees for a specific appointment:
 * - GET: Retrieve all assignees for an appointment
 * - POST: Add assignees to an appointment
 * - DELETE: Remove all assignees from an appointment
 * 
 * Uses PostgreSQL directly via postgresClient for database operations.
 * All operations require authentication via getSessionUser().
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";

/**
 * GET /api/appointments/[id]/assignees
 * 
 * Retrieves all assignees for a specific appointment.
 * 
 * @param req - Next.js request object
 * @param context - Contains route parameter (id)
 * @returns JSON response with assignees array or error message
 */
export async function GET(req: NextRequest, context: any) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Next.js 15: params must be awaited
    const { id } = await context.params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    const result = await query(
      `SELECT * FROM appointment_assignee WHERE appointment = $1 ORDER BY created_at DESC`,
      [id]
    );

    return NextResponse.json({ assignees: result.rows || [] });
  } catch (error: any) {
    console.error("Error fetching appointment assignees:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments/[id]/assignees
 * 
 * Adds assignees to an appointment.
 * 
 * Request Body:
 * - assignees: Array of assignee objects
 * 
 * @param req - Next.js request object
 * @param context - Contains route parameter (id)
 * @returns JSON response with success message or error
 */
export async function POST(req: NextRequest, context: any) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Next.js 15: params must be awaited
    const { id } = await context.params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    // Verify appointment ownership
    const appointmentResult = await query(
      `SELECT user_id FROM appointments WHERE id = $1`,
      [id]
    );

    if (appointmentResult.rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointmentResult.rows[0].user_id !== sessionUser.userId) {
      return NextResponse.json({ error: "Forbidden: You can only modify your own appointments" }, { status: 403 });
    }

    const { assignees } = await req.json();

    if (!Array.isArray(assignees) || assignees.length === 0) {
      return NextResponse.json({ error: "Assignees array is required" }, { status: 400 });
    }

    // Insert assignees
    for (const assignee of assignees) {
      // Important: The "user" field in appointment_assignee has a foreign key to users.id
      // If user_type is "patients" or "relatives", the user field should be NULL
      // because patients/relatives are not users. Only actual users (user_type = "users") should have a user ID.
      const userId = assignee.user_type === "users" ? (assignee.user || null) : null;
      
      await query(
        `INSERT INTO appointment_assignee (appointment, "user", user_type, invited_email, status, permission, invited_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT DO NOTHING`,
        [
          id,
          userId,
          assignee.user_type || null,
          assignee.invited_email || null,
          assignee.status || "pending",
          assignee.permission || "read",
          sessionUser.userId,
        ]
      );
    }

    return NextResponse.json({ message: "Assignees added successfully" });
  } catch (error: any) {
    console.error("Error adding appointment assignees:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/[id]/assignees
 * 
 * Removes all assignees from an appointment.
 * 
 * @param req - Next.js request object
 * @param context - Contains route parameter (id)
 * @returns JSON response with success message or error
 */
export async function DELETE(req: NextRequest, context: any) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Next.js 15: params must be awaited
    const { id } = await context.params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid appointment ID format" }, { status: 400 });
    }

    // Verify appointment ownership
    const appointmentResult = await query(
      `SELECT user_id FROM appointments WHERE id = $1`,
      [id]
    );

    if (appointmentResult.rows.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointmentResult.rows[0].user_id !== sessionUser.userId) {
      return NextResponse.json({ error: "Forbidden: You can only modify your own appointments" }, { status: 403 });
    }

    await query(
      `DELETE FROM appointment_assignee WHERE appointment = $1`,
      [id]
    );

    return NextResponse.json({ message: "Assignees deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting appointment assignees:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

