/**
 * server-prefetch.ts — Server-side data helpers for SSR initial cache seeding.
 *
 * Each function mirrors the corresponding API route's Prisma query and returns
 * the exact data shape stored by the matching TanStack Query hook. Server
 * page.tsx files call these helpers, pass the result to client page components
 * as `initialXxx` props, and the client seeds the cache via:
 *   useLayoutEffect → queryClient.setQueryData(queryKeys.*, data)
 *
 * Pattern (mirrors stock-inventory architecture):
 *   server page.tsx (async)
 *     └── prefetch helper (Prisma / Redis)
 *           └── initialXxx props
 *                 └── client component: useLayoutEffect → setQueryData
 *                       └── useQuery hooks find cache → no loading flash
 *
 * All functions wrap in try/catch and return null on error so a DB or Redis
 * failure never crashes the page — the client falls back to its normal fetch.
 */

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import {
  serializeCategory,
  serializePatient,
  serializeAppointment,
  serializeInvoice,
  serializeActivitySnapshot,
} from "@/lib/serializers";
import { patientDetailInclude, patientUserPick } from "@/lib/patient-api-include";
import { getInsightsData, type InsightsPayload } from "@/lib/insights-data";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import type { Category, Patient, PatientSnapshot, User } from "@/types/types";
import type { DashboardOverview } from "@/hooks/useDashboardOverview";

// ─── Shared types ─────────────────────────────────────────────────────────────

/**
 * Shape stored at queryKeys.patientPortal.all.
 * Mirrors the PortalData interface in PatientPortalPage.tsx.
 *
 * `serializeAppointment` maps `category_id` → a string field named `category`.
 * The portal response overlays a richer object `{ label, color }` in that slot,
 * so we Omit the string `category` field and re-declare it as the object shape.
 */
export type PortalPrefetchData = {
  appointments: (Omit<ReturnType<typeof serializeAppointment>, "category"> & {
    category?: { label: string; color: string | null };
    owner?: { display_name: string | null; email: string };
  })[];
  patient: Patient | null;
  message?: string;
};

// ─── Categories ───────────────────────────────────────────────────────────────

/**
 * Mirrors GET /api/categories.
 * Cache key: queryKeys.categories.all → stores Category[].
 * Categories are global (no per-user filter) — same as the API route.
 */
export async function prefetchCategories(): Promise<Category[] | null> {
  try {
    const rows = await prisma.category.findMany({
      orderBy: { created_at: "desc" },
    });
    return rows.map(serializeCategory) as Category[];
  } catch {
    return null;
  }
}

// ─── Patients list ────────────────────────────────────────────────────────────

/**
 * Mirrors GET /api/patients.
 * Cache key: queryKeys.patients.all → stores Patient[].
 * Includes primary_doctor join for list-level display labels.
 */
export async function prefetchPatients(): Promise<Patient[] | null> {
  try {
    const rows = await prisma.patient.findMany({
      orderBy: { created_at: "desc" },
      include: { primary_doctor: patientUserPick },
    });
    return rows.map(serializePatient) as Patient[];
  } catch {
    return null;
  }
}

// ─── Patient detail ───────────────────────────────────────────────────────────

/**
 * Mirrors GET /api/patients/:id.
 * Cache key: queryKeys.patients.detail(patientId) → stores Patient.
 */
export async function prefetchPatient(patientId: string): Promise<Patient | null> {
  try {
    const row = await prisma.patient.findUnique({
      where: { id: patientId },
      include: patientDetailInclude,
    });
    if (!row) return null;
    return serializePatient(row) as Patient;
  } catch {
    return null;
  }
}

// ─── Patient snapshot ─────────────────────────────────────────────────────────

/**
 * Mirrors GET /api/patients/:id/snapshot.
 * Cache key: queryKeys.patients.snapshot(patientId) → stores PatientSnapshot.
 * Includes the owner (doctor) join added for the appointments table columns.
 */
export async function prefetchPatientSnapshot(patientId: string): Promise<PatientSnapshot | null> {
  try {
    const patientRaw = await prisma.patient.findUnique({
      where: { id: patientId },
      include: patientDetailInclude,
    });
    if (!patientRaw) return null;

    const appointmentsRaw = await prisma.appointment.findMany({
      where: { patient_id: patientId },
      orderBy: { start: "desc" },
      take: 50,
      include: {
        category: true,
        // Doctor join for the "Refer Doctor" column in the patient detail screen.
        owner: { select: { id: true, display_name: true, email: true } },
      },
    });

    const appointmentIds = appointmentsRaw.map((a) => a.id);

    type InvoiceRow = Awaited<ReturnType<typeof prisma.invoice.findMany>>[number];
    const [activitiesRaw, invoicesRaw]: [
      Awaited<ReturnType<typeof prisma.activity.findMany>>,
      InvoiceRow[],
    ] =
      appointmentIds.length === 0
        ? [[], []]
        : await Promise.all([
            prisma.activity.findMany({
              where: { appointment_id: { in: appointmentIds } },
              orderBy: { created_at: "desc" },
              take: 200,
              include: { created_by: { select: { display_name: true, email: true } } },
            }),
            prisma.invoice.findMany({
              where: { appointment_id: { in: appointmentIds } },
              orderBy: { created_at: "desc" },
            }),
          ]);

    return {
      patient: serializePatient(patientRaw) as Patient,
      appointments: appointmentsRaw.map((a) => ({
        ...serializeAppointment(a),
        category_label: a.category?.label ?? null,
        doctor_id: a.owner?.id ?? null,
        doctor_display: a.owner?.display_name ?? null,
        doctor_email: a.owner?.email ?? null,
      })),
      activities: activitiesRaw.map(serializeActivitySnapshot),
      invoices: invoicesRaw.map(serializeInvoice),
    } as PatientSnapshot;
  } catch {
    return null;
  }
}

// ─── Dashboard overview ───────────────────────────────────────────────────────

/** Must stay in sync with OVERVIEW_CACHE_TTL in /api/dashboard/overview/route.ts */
const OVERVIEW_CACHE_TTL = 90;

/**
 * Mirrors GET /api/dashboard/overview.
 * Cache key: queryKeys.dashboard.overview → stores DashboardOverview.
 *
 * Checks Redis first — if the API route already populated the 90 s cache,
 * this returns immediately without running any Prisma queries. Falls back
 * to the same 16-query Prisma aggregation as the API route, and populates
 * Redis for subsequent calls within the TTL window.
 */
export async function prefetchDashboardOverview(userId: string): Promise<DashboardOverview | null> {
  try {
    const cacheKey = `dashboard:overview:${userId}`;

    // Leverage the existing server-side Redis cache (avoids all Prisma queries when warm)
    if (redis.isConfigured) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached as string) as DashboardOverview;
    }

    // Cold cache — run the same Prisma aggregation as the API route
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
      totalAppointments,
      todayAppointments,
      weekAppointments,
      monthAppointments,
      doneCount,
      pendingCount,
      alertCount,
      totalPatients,
      activePatients,
      totalDoctors,
      totalCategories,
      nextAppointmentRaw,
      recentAppointments,
      overdueCount,
      totalInvoices,
      paidInvoices,
    ] = await Promise.all([
      prisma.appointment.count({ where: { user_id: userId } }),
      prisma.appointment.count({ where: { user_id: userId, start: { gte: todayStart, lte: todayEnd } } }),
      prisma.appointment.count({ where: { user_id: userId, start: { gte: weekStart, lte: weekEnd } } }),
      prisma.appointment.count({ where: { user_id: userId, start: { gte: monthStart, lte: monthEnd } } }),
      prisma.appointment.count({ where: { user_id: userId, status: "done" } }),
      prisma.appointment.count({ where: { user_id: userId, status: "pending" } }),
      prisma.appointment.count({ where: { user_id: userId, status: "alert" } }),
      prisma.patient.count(),
      prisma.patient.count({ where: { active: true } }),
      prisma.user.count({ where: { role: "doctor" } }),
      prisma.category.count(),
      prisma.appointment.findFirst({
        where: { user_id: userId, start: { gt: now }, status: { not: "done" } },
        orderBy: { start: "asc" },
        select: { id: true, title: true, start: true, end: true, location: true },
      }),
      prisma.appointment.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          start: true,
          end: true,
          status: true,
          patient: { select: { firstname: true, lastname: true } },
        },
      }),
      prisma.appointment.count({
        where: { user_id: userId, end: { lt: now }, status: { not: "done" } },
      }),
      prisma.invoice.count({ where: { user_id: userId } }),
      prisma.invoice.count({ where: { user_id: userId, status: "paid" } }),
    ]);

    const [paidRevenue, outstandingRevenue] = await Promise.all([
      prisma.invoice.aggregate({
        where: { user_id: userId, status: "paid" },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: { user_id: userId, status: { in: ["draft", "sent"] } },
        _sum: { amount: true },
      }),
    ]);

    const payload: DashboardOverview = {
      appointments: {
        total: totalAppointments,
        today: todayAppointments,
        thisWeek: weekAppointments,
        thisMonth: monthAppointments,
        done: doneCount,
        pending: pendingCount,
        alert: alertCount,
        overdue: overdueCount,
      },
      patients: { total: totalPatients, active: activePatients },
      doctors: totalDoctors,
      categories: totalCategories,
      nextAppointment: nextAppointmentRaw
        ? {
            id: nextAppointmentRaw.id,
            title: nextAppointmentRaw.title,
            start: nextAppointmentRaw.start.toISOString(),
            end: nextAppointmentRaw.end.toISOString(),
            location: nextAppointmentRaw.location,
          }
        : null,
      recentAppointments: recentAppointments.map((a) => ({
        id: a.id,
        title: a.title,
        start: a.start.toISOString(),
        end: a.end.toISOString(),
        status: a.status,
        patientName: a.patient
          ? `${a.patient.firstname} ${a.patient.lastname}`
          : null,
      })),
      revenue: {
        paidCents: paidRevenue._sum.amount ?? 0,
        outstandingCents: outstandingRevenue._sum.amount ?? 0,
        totalInvoices,
        paidInvoices,
      },
    };

    // Populate Redis so the API route also benefits from this fresh data
    if (redis.isConfigured) {
      void redis.set(cacheKey, JSON.stringify(payload), OVERVIEW_CACHE_TTL);
    }

    return payload;
  } catch {
    return null;
  }
}

// ─── Insights ─────────────────────────────────────────────────────────────────

/**
 * Mirrors GET /api/insights via the shared getInsightsData() helper.
 * Cache key: queryKeys.insights.all → stores InsightsPayload.
 */
export async function prefetchInsights(userId: string): Promise<InsightsPayload | null> {
  try {
    return await getInsightsData(userId);
  } catch {
    return null;
  }
}

// ─── Doctors directory ────────────────────────────────────────────────────────

/** Doctor card shape stored at queryKeys.doctors.all — mirrors /api/doctors response */
export type DoctorPrefetchRow = {
  id: string;
  email: string;
  display_name: string | null;
  image: string | null;
  specialty: string | null;
  bio: string | null;
  role: string | null;
  created_at: string;
  availabilities: { weekday: number; start_min: number; end_min: number; timezone: string }[];
  appointment_types: { id: string; name: string; duration_minutes: number }[];
  patient_count: number;
};

/**
 * Mirrors GET /api/doctors.
 * Cache key: queryKeys.doctors.all → stores { doctors: DoctorPrefetchRow[] } for ServicesPage.
 * Returns doctors with specialty, bio, availabilities, and patient count.
 */
export async function prefetchDoctors(): Promise<{ doctors: DoctorPrefetchRow[] } | null> {
  try {
    const rows = await prisma.user.findMany({
      where: { role: "doctor" },
      select: {
        id: true,
        email: true,
        display_name: true,
        image: true,
        specialty: true,
        bio: true,
        created_at: true,
        role: true,
        doctor_availabilities: { select: { weekday: true, start_min: true, end_min: true, timezone: true } },
        appointment_types_owned: { select: { id: true, name: true, duration_minutes: true } },
        _count: { select: { patients_primary_doctor: true } },
      },
      orderBy: [{ display_name: { sort: "asc", nulls: "last" } }, { email: "asc" }],
    });

    const doctors: DoctorPrefetchRow[] = rows.map((d) => ({
      id: d.id,
      email: d.email,
      display_name: d.display_name,
      image: d.image,
      specialty: d.specialty,
      bio: d.bio,
      role: d.role,
      created_at: d.created_at.toISOString(),
      availabilities: d.doctor_availabilities,
      appointment_types: d.appointment_types_owned,
      patient_count: d._count.patients_primary_doctor,
    }));

    return { doctors };
  } catch {
    return null;
  }
}

/** Appointment type shape for global types prefetch */
export type GlobalAppointmentType = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
};

/**
 * Mirrors GET /api/appointment-types/global.
 * Cache key: queryKeys.appointmentTypes.global → stores GlobalAppointmentType[].
 * Returns only global types (user_id = null) for the Services page.
 */
export async function prefetchGlobalAppointmentTypes(): Promise<GlobalAppointmentType[] | null> {
  try {
    const types = await prisma.appointmentType.findMany({
      where: { user_id: null },
      select: { id: true, name: true, description: true, duration_minutes: true },
      orderBy: [{ duration_minutes: "asc" }, { name: "asc" }],
    });
    return types;
  } catch {
    return null;
  }
}

// ─── Patient portal ───────────────────────────────────────────────────────────

/**
 * Mirrors GET /api/patient-portal.
 * Cache key: queryKeys.patientPortal.all → stores PortalPrefetchData.
 * Looks up the user's linked patient record by email match.
 */
export async function prefetchPortalData(userId: string): Promise<PortalPrefetchData | null> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const patient = await prisma.patient.findFirst({ where: { email: user.email } });
    if (!patient) {
      return {
        appointments: [],
        patient: null,
        message: "No patient record found for your email",
      };
    }

    const appointmentsRaw = await prisma.appointment.findMany({
      where: { patient_id: patient.id },
      include: {
        category: true,
        owner: { select: { display_name: true, email: true } },
      },
      orderBy: { start: "desc" },
    });

    return {
      appointments: appointmentsRaw.map((a) => ({
        ...serializeAppointment(a),
        category: a.category
          ? { label: a.category.label, color: a.category.color }
          : undefined,
        owner: a.owner
          ? { display_name: a.owner.display_name, email: a.owner.email }
          : undefined,
      })),
      patient: serializePatient(patient) as Patient,
    };
  } catch {
    return null;
  }
}
