import { insightsFilterKeyStable, type InsightsQueryKey } from "@/lib/insights-scope";

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
    snapshot: (id: string) => [...queryKeys.categories.all, id, "snapshot"] as const,
  },
  patients: {
    all: ["app", "patients"] as const,
    detail: (id: string) => [...queryKeys.patients.all, id] as const,
    snapshot: (id: string) => [...queryKeys.patients.all, id, "snapshot"] as const,
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
  },
  organizations: {
    all: ["app", "organizations"] as const,
    detail: (id: string) => ["app", "organizations", id] as const,
    members: (id: string) => ["app", "organizations", id, "members"] as const,
  },
  invoices: {
    all: ["app", "invoices"] as const,
    detail: (id: string) => ["app", "invoices", id] as const,
    /** CP org billing panel — GET /api/invoices?organizationId= */
    byOrganization: (organizationId: string) =>
      [...queryKeys.invoices.all, "org", organizationId] as const,
    /** CP org billing KPI row — GET /api/invoices/billing-totals?organizationId= */
    byOrganizationTotals: (organizationId: string) =>
      [...queryKeys.invoices.all, "org", organizationId, "totals"] as const,
  },
  billing: {
    root: ["app", "billing"] as const,
    appointmentOptions: (search: string, includeBilled = false) =>
      ["app", "billing", "appointment-options", search, includeBilled] as const,
  },
  dashboard: {
    overview: ["app", "dashboard", "overview"] as const,
  },
  googleCalendar: {
    root: ["app", "google-calendar"] as const,
  },
  insights: {
    /** Prefix — invalidateQueries({ queryKey: insights.root }) busts all scope variants */
    root: ["app", "insights"] as const,
    all: ["app", "insights"] as const,
    filter: (filter: InsightsQueryKey) => {
      const stable = insightsFilterKeyStable(filter);
      return ["app", "insights", stable.scope, stable.doctorId ?? "", stable.period] as const;
    },
  },
  analytics: {
    all: ["app", "analytics"] as const,
  },
  patientPortal: {
    all: ["app", "patient-portal"] as const,
  },
  /** Doctor's own portal dashboard (today's schedule, metrics, type config) */
  doctorPortal: {
    all: ["app", "doctor-portal"] as const,
  },
  /** Admin's portal dashboard (global KPIs, recent activity, org settings) */
  adminPortal: {
    all: ["app", "admin-portal"] as const,
  },
  doctors: {
    all: ["app", "doctors"] as const,
    detail: (id: string) => ["app", "doctors", id] as const,
    /** Weekly availability windows for CRUD management on doctor detail page */
    availability: (doctorId: string) => ["app", "doctors", doctorId, "availability"] as const,
    /** Time-off blocks for CRUD management on doctor detail page */
    timeOff: (doctorId: string) => ["app", "doctors", doctorId, "time-off"] as const,
    /** Primary-doctor roster on CP doctor detail */
    assignedPatients: (doctorId: string) =>
      ["app", "doctors", doctorId, "assigned-patients"] as const,
    /** Related appointments panel — owner or treating physician (portal + CP doctor detail). */
    snapshot: (doctorId: string) => ["app", "doctors", doctorId, "snapshot"] as const,
  },
  /**
   * Appointment types: per-doctor lists (`GET /api/appointment-types?doctorId=`) + global card data.
   * Use `appointmentTypes.all` in invalidators so every doctor-specific key refetches without enumerating UUIDs.
   */
  appointmentTypes: {
    all: ["app", "appointment-types"] as const,
    byDoctor: (doctorId: string) => ["app", "appointment-types", doctorId] as const,
    /** Global types shared across all doctors (user_id = null) */
    global: ["app", "appointment-types", "global"] as const,
    /** Merged global + deduped additional types for `/services` */
    catalog: ["app", "appointment-types", "catalog"] as const,
  },
  /** Slot picker — invalidate tree on appointment changes */
  availability: {
    root: ["app", "availability"] as const,
    slots: (doctorId: string, dateStr: string, typeId: string) =>
      [...queryKeys.availability.root, "slots", doctorId, dateStr, typeId] as const,
    /**
     * Month map for SchedulingMonthCalendar.
     * `scopeKey` = appointment type UUID or `flex:30` (see schedulingScopeKeySegment).
     */
    dates: (
      doctorId: string,
      scopeKey: string,
      monthYm: string,
      excludeAppointmentId?: string
    ) =>
      [
        ...queryKeys.availability.root,
        "dates",
        doctorId,
        scopeKey,
        monthYm,
        excludeAppointmentId ?? "",
      ] as const,
    dayGrid: (
      doctorId: string,
      dateStr: string,
      scopeKey: string,
      excludeAppointmentId?: string
    ) =>
      [
        ...queryKeys.availability.root,
        "dayGrid",
        doctorId,
        dateStr,
        scopeKey,
        excludeAppointmentId ?? "",
      ] as const,
  },
} as const;
