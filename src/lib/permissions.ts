/**
 * Permissions Utility Functions
 * 
 * This file contains functions for managing and checking user permissions
 * on appointments and other resources. It implements a role-based access control (RBAC) system.
 */

import { Appointment, AppointmentAssignee } from "@/types/types";

/**
 * getUserAppointmentPermission Function
 * 
 * Determines the permission level a user has for a specific appointment.
 * This is the core authorization logic for the appointment system.
 * 
 * Permission Hierarchy:
 * 1. "owner" - Highest level: User created the appointment (user_id matches)
 * 2. "full" - Full access: Can read, write, and delete
 * 3. "write" - Write access: Can read and modify
 * 4. "read" - Read-only access: Can view but not modify
 * 5. null - No access: User has no permissions
 * 
 * Logic Flow:
 * 1. If no userId, return null (not authenticated)
 * 2. If user is the creator (user_id matches), return "owner"
 * 3. Check if user is an accepted assignee (by user ID or email)
 * 4. Return assignee's permission level or null if not found
 * 
 * @param appointment - The appointment to check permissions for
 * @param assignees - Array of appointment assignees (invited users)
 * @param userId - ID of the user to check permissions for
 * @returns Permission level string or null if no access
 * 
 * Example usage:
 * const permission = getUserAppointmentPermission({
 *   appointment: myAppointment,
 *   assignees: appointmentAssignees,
 *   userId: currentUser.id
 * });
 * if (permission === "owner" || permission === "write") {
 *   // Allow editing
 * }
 */
export function getUserAppointmentPermission({
  appointment,
  assignees,
  userId,
}: {
  appointment: Appointment;
  assignees?: AppointmentAssignee[];
  userId: string | null | undefined;
}): "owner" | "full" | "write" | "read" | null {
  // No user ID means not authenticated - no access
  if (!userId) return null;
  
  // Owner check: User created the appointment
  if (appointment.user_id === userId) return "owner";
  
  // Check if user is an accepted assignee
  // Search by both user ID (if they have an account) and email (if invited by email)
  // Only count accepted invitations (not pending or declined)
  const assignee = assignees?.find(
    (a) =>
      (a.user === userId || a.invited_email === userId) &&
      a.status === "accepted"
  );
  
  // Return the assignee's permission level, or null if not found
  return assignee?.permission || null;
}
