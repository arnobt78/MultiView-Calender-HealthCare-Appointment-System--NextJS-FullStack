/**
 * Centralized React Query Key Factory
 *
 * Benefits:
 * 1. Prevents trailing/missing parts in query keys
 * 2. Root prefix "app" allows one-shot invalidation of all list/detail data (invalidateQueries({ queryKey: queryKeys.root }))
 * 3. Type-safe keys across the application
 */
export const queryKeys = {
  /** Invalidate this to refetch all app data (lists + dependent views) without page refresh */
  root: ["app"] as const,
  auth: {
    me: ["app", "auth", "me"] as const,
  },
  appointments: {
    all: ["app", "appointments"] as const,
    detail: (id: string) => [...queryKeys.appointments.all, id] as const,
    search: (query: string) => [...queryKeys.appointments.all, "search", query] as const,
  },
  categories: {
    all: ["app", "categories"] as const,
    detail: (id: string) => [...queryKeys.categories.all, id] as const,
  },
  patients: {
    all: ["app", "patients"] as const,
    detail: (id: string) => [...queryKeys.patients.all, id] as const,
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
  activities: {
    all: ["app", "activities"] as const,
    byAppointment: (appointmentId: string) => [...queryKeys.activities.all, "appointment", appointmentId] as const,
  },
  dashboardAccess: {
    all: ["app", "dashboard-access"] as const,
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
} as const;
