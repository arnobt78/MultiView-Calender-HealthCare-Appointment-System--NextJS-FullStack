"use client";

/**
 * Hooks barrel — one import site for the entire app.
 *
 * Core utility hooks (copy to every React/Next.js project):
 *   useDebounce         — stop hammering your API on every keystroke
 *   usePrevious         — track previous values without re-render loops
 *   useLocalStorage     — state that survives refresh (SSR-safe, tab-synced)
 *   useMediaQuery       — responsive logic, not just responsive styles
 *   useAbortController  — cancel requests on unmount, prevent race conditions
 *
 * Usage:
 *   import { useDebounce, useAuth, useAppointments } from "@/hooks";
 */

export * from "./useDebounce";
export * from "./usePrevious";
export * from "./useLocalStorage";
export * from "./useMediaQuery";
export * from "./useAbortController";

export * from "./useAI";
export * from "./useAnalytics";
export * from "./useAppointments";
export * from "./useAssignees";
export * from "./useAuth";
export * from "./useAvailabilitySlots";
export * from "./useSchedulingDayGrid";
export * from "./useSchedulingMonthDates";
export * from "./useBookableTypesForDoctor";
export * from "./useAppointmentTypes";
export * from "./useCategories";
export * from "./useDashboardAccess";
export * from "./useDashboardOverview";
export * from "./useGoogleCalendar";
export * from "./useInsights";
export * from "./useInvitations";
export * from "./useNormalizedEntities";
export * from "./useNotifications";
export * from "./useNotificationStream";
export * from "./useOrganization";
export * from "./useOwnerUserSummaries";
export * from "./usePatientListMetrics";
export * from "./usePatients";
export * from "./usePayments";
export * from "./useUsers";
