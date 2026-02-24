/**
 * Centralized React Query Key Factory
 * 
 * Benefits:
 * 1. Prevents trailing/missing parts in query keys
 * 2. Allows easy invalidation of related queries
 * 3. Type-safe keys across the application
 */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    detail: (id: string) => [...queryKeys.appointments.all, id] as const,
    search: (query: string) => [...queryKeys.appointments.all, "search", query] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  patients: {
    all: ["patients"] as const,
  },
  relatives: {
    all: ["relatives"] as const,
  },
  invitations: {
    all: ["invitations"] as const,
    byType: (type: "appointment" | "dashboard") => [...queryKeys.invitations.all, type] as const,
  },
  activities: {
    all: ["activities"] as const,
    byAppointment: (appointmentId: string) => [...queryKeys.activities.all, "appointment", appointmentId] as const,
  },
  dashboardAccess: {
    all: ["dashboard-access"] as const,
  },
} as const;
