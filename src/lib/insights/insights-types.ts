/**
 * Insights payload v2 section types — legacy flat fields remain on InsightsPayload for UI migration.
 */

import type { InsightsPeriod } from "@/lib/insights/insights-period";

export type InsightsAppointmentTotals = {
  /** All appointments in scope (past + future scheduled). */
  all: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  yearToDate: number;
  done: number;
  pending: number;
  /** Scheduled appointments not started yet (start > now). */
  upcoming: number;
  overdue: number;
  telehealthCount: number;
  telehealthPct: number;
  /** Average visit length for appointments in the selected View-as period. */
  avgDurationMinutes: number;
};

export type InsightsTrendPoint = {
  label: string;
  count: number;
};

export type InsightsAppointmentsSection = {
  /** Calendar KPI windows — not tied to View-as period. */
  totals: InsightsAppointmentTotals;
  /** Done / pending / alert within selected chart period + scope. */
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  trend: InsightsTrendPoint[];
  busiestDayOfWeek: { day: number; label: string; count: number }[];
  statusOverTime: { month: string; done: number; pending: number; alert: number }[];
  typeBreakdown: { name: string; count: number }[];
};

export type InsightsPatientsSection = {
  /** Distinct patients with appointments from period start through now (excludes future). */
  newInPeriod: number;
  /** Distinct patients with appointments across full inclusive period window. */
  activeInPeriod: number;
  ageDistribution: { label: string; count: number }[];
  topPatients: {
    id: string;
    name: string;
    firstname: string;
    lastname: string;
    email: string | null;
    birth_date: string | null;
    care_level: number | null;
    clinical_profile?: { image_url?: string } | null;
    count: number;
  }[];
};

export type InsightsRevenueSection = {
  paidInPeriod: number;
  paidPrevPeriod: number;
  invoiceByStatus: Record<string, number>;
  revenueTrend: InsightsTrendPoint[];
  paymentSuccessPct: number;
  avgInvoiceCents: number;
};

export type InsightsDoctorRow = {
  doctorId: string;
  name: string;
  specialty: string | null;
  appointmentCount: number;
  revenueCents: number;
  /** Sum of weekly availability window hours (configuration). */
  weeklyHours: number;
  /** Distinct calendar days with time-off overlapping the chart period. */
  timeOffDaysInPeriod: number;
};

/** Staff insights — org roster or single-doctor (my practice / admin drill-down). */
export type InsightsDoctorsSection = {
  mode: "organization" | "personal";
  byDoctor: InsightsDoctorRow[];
  bySpecialty: { specialty: string; count: number }[];
  /** Bar chart: org = hours per doctor; personal = hours per weekday. */
  weeklyHours: InsightsTrendPoint[];
  /** Bar chart: time-off days in period per doctor (org) or total (personal). */
  timeOffInPeriod: InsightsTrendPoint[];
};

export type InsightsMeta = {
  period: InsightsPeriod;
  /** Human label for chart subtitles (Today, This week, month name, year). */
  periodLabel: string;
  /** Scope fragment for chart subtitles (Organization-wide, My practice, doctor name). */
  scopeLabel: string;
  generatedAt: string;
  organizationWide: boolean;
};

export type InsightsPayloadV2 = {
  meta: InsightsMeta;
  appointments: InsightsAppointmentsSection;
  patients: InsightsPatientsSection;
  revenue: InsightsRevenueSection;
  doctors: InsightsDoctorsSection | null;
};
