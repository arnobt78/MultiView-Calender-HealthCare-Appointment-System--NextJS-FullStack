/**
 * Centralized React Query Key Factory
 *
 * Benefits:
 * 1. Prevents trailing/missing parts in query keys
 * 2. Root prefix "app" allows invalidation of whole trees (e.g. ["app", "patients"] matches list + detail)
 * 3. Type-safe keys across the application
 *
 * Prefix rule: invalidateQueries({ queryKey: ["app", "patients"] }) matches all patient queries.
 */
export const queryKeys = {
  /** Invalidate this to refetch all app data (use sparingly — e.g. session reset) */
  root: ["app"] as const,
  auth: {
    me: ["app", "auth", "me"] as const,
  },
  appointments: {
    all: ["app", "appointments"] as const,
    detail: (id: string) => [...queryKeys.appointments.all, id] as const,
    search: (query: string) => [...queryKeys.appointments.all, "search", query] as const,
    assignees: (id: string) => [...queryKeys.appointments.all, id, "assignees"] as const,
  },
  categories: {
    all: ["app", "categories"] as const,
    detail: (id: string) => [...queryKeys.categories.all, id] as const,
  },
  patients: {
    all: ["app", "patients"] as const,
    detail: (id: string) => [...queryKeys.patients.all, id] as const,
    snapshot: (id: string) => [...queryKeys.patients.all, id, "snapshot"] as const,
  },
  relatives: {
    all: ["app", "relatives"] as const,
    detail: (id: string) => [...queryKeys.relatives.all, id] as const,
  },
  users: {
    all: ["app", "users"] as const,
    detail: (id: string) => [...queryKeys.users.all, id] as const,
    search: (q: string) => [...queryKeys.users.all, "search", q] as const,
  },
  invitations: {
    all: ["app", "invitations"] as const,
    byType: (type: "appointment" | "dashboard") => [...queryKeys.invitations.all, type] as const,
  },
  /** Global activity log (GET /api/activities) vs per-appointment sub-resource */
  activities: {
    list: ["app", "activities", "list"] as const,
    byAppointment: (appointmentId: string) =>
      ["app", "activities", "appointment", appointmentId] as const,
  },
  assignees: {
    all: ["app", "appointment-assignees"] as const,
  },
  dashboardAccess: {
    all: ["app", "dashboard-access"] as const,
    /** GET /api/dashboard-access?status=accepted */
    accepted: ["app", "dashboard-access", "accepted"] as const,
  },
  notifications: {
    all: ["app", "notifications"] as const,
    unreadCount: ["app", "notifications", "unread-count"] as const,
  },
  organizations: {
    all: ["app", "organizations"] as const,
    detail: (id: string) => ["app", "organizations", id] as const,
    members: (id: string) => ["app", "organizations", id, "members"] as const,
  },
  invoices: {
    all: ["app", "invoices"] as const,
    detail: (id: string) => ["app", "invoices", id] as const,
  },
  dashboard: {
    overview: ["app", "dashboard", "overview"] as const,
  },
  googleCalendar: {
    root: ["app", "google-calendar"] as const,
  },
  insights: {
    all: ["app", "insights"] as const,
  },
  analytics: {
    all: ["app", "analytics"] as const,
  },
  patientPortal: {
    all: ["app", "patient-portal"] as const,
  },
  /** Appointment types per doctor — used by the patient portal booking wizard */
  appointmentTypes: {
    byDoctor: (doctorId: string) => ["app", "appointment-types", doctorId] as const,
  },
  /** Slot picker — invalidate tree on appointment changes */
  availability: {
    root: ["app", "availability"] as const,
    slots: (doctorId: string, dateStr: string, typeId: string) =>
      [...queryKeys.availability.root, "slots", doctorId, dateStr, typeId] as const,
  },
} as const;
