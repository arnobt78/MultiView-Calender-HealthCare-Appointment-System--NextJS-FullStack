import { NextRequest, NextResponse } from "next/server";

// GET /api/appointments/[id]/permissions - Check appointment permissions for current user
export async function GET(req: NextRequest) {
  // Extract params from URL
  const url = new URL(req.url);
  const id = url.pathname.split("/").at(-2);
  // Auth required: get user from session
  // Query DB for appointment_assignee or owner
  // Return permission level (read, write, full) for this appointment
  // (To be implemented)
  return NextResponse.json({ permission: "read", id });
}

// DELETE /api/appointments/[id]/permissions - Discard appointment invitation
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").at(-2);
  if (!id) {
    return NextResponse.json({ error: "Missing appointment ID" }, { status: 400 });
  }
  // Auth check (ensure user is sender or receiver)
  try {
    const { getSessionUser } = await import("@/lib/session");
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Connect to DB and delete appointment_assignee by id
    const { query } = await import("@/lib/postgresClient");
    const result = await query(
      `DELETE FROM appointment_assignee WHERE id = $1`,
      [id]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
