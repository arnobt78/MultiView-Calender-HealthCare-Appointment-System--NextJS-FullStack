/**
 * Insights payload v2 section types — legacy flat fields remain on InsightsPayload for UI migration.
 */

import type { InsightsPeriod } from "@/lib/insights/insights-period";

export type InsightsAppointmentTotals = {
  all: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  yearToDate: number;
  done: number;
  pending: number;
  upcoming: number;
  overdue: number;
  telehealthCount: number;
  telehealthPct: number;
  avgDurationMinutes: number;
};

export type InsightsTrendPoint = {
  label: string;
  count: number;
};

export type InsightsAppointmentsSection = {
  totals: InsightsAppointmentTotals;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  trend: InsightsTrendPoint[];
  busiestDayOfWeek: { day: number; label: string; count: number }[];
  statusOverTime: { month: string; done: number; pending: number; alert: number }[];
  typeBreakdown: { name: string; count: number }[];
};

export type InsightsPatientsSection = {
  newInPeriod: number;
  activeInPeriod: number;
  ageDistribution: { label: string; count: number }[];
  topPatients: { name: string; count: number }[];
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
};

export type InsightsDoctorsSection = {
  byDoctor: InsightsDoctorRow[];
  bySpecialty: { specialty: string; count: number }[];
};

export type InsightsMeta = {
  period: InsightsPeriod;
  periodLabel: string;
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
