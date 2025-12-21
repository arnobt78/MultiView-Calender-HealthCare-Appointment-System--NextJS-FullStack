/**
 * Appointment Activities by Appointment ID API Route Handler
 * 
 * This file implements RESTful API endpoints for managing activities for a specific appointment:
 * - GET: Retrieve all activities for an appointment
 * - POST: Add activities to an appointment
 * - DELETE: Remove all activities from an appointment
 * 
 * Uses PostgreSQL directly via postgresClient for database operations.
 * All operations require authentication via getSessionUser().
 */

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgresClient";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";

/**
 * GET /api/appointments/[id]/activities
 * 
 * Retrieves all activities for a specific appointment.
 * 
 * @param req - Next.js request object
 * @param context - Contains route parameter (id)
 * @returns JSON response with activities array or error message
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
      `SELECT * FROM activities WHERE appointment = $1 ORDER BY created_at DESC`,
      [id]
    );

    return NextResponse.json({ activities: result.rows || [] });
  } catch (error: any) {
    console.error("Error fetching appointment activities:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments/[id]/activities
 * 
 * Adds activities to an appointment.
 * 
 * Request Body:
 * - activities: Array of activity objects
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

    const { activities } = await req.json();

    if (!Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json({ error: "Activities array is required" }, { status: 400 });
    }

    // Insert activities
    for (const activity of activities) {
      await query(
        `INSERT INTO activities (appointment, type, content, created_by, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          id,
          activity.type || null,
          activity.content || null,
          activity.created_by || sessionUser.userId,
        ]
      );
    }

    return NextResponse.json({ message: "Activities added successfully" });
  } catch (error: any) {
    console.error("Error adding appointment activities:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/[id]/activities
 * 
 * Removes all activities from an appointment.
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
      `DELETE FROM activities WHERE appointment = $1`,
      [id]
    );

    return NextResponse.json({ message: "Activities deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting appointment activities:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

