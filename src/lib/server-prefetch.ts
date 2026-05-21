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

import {
  buildServiceCatalog,
  type AdditionalCatalogInput,
  type GlobalCatalogInput,
  type ServiceCatalogRow,
} from "@/lib/appointment-service-catalog";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import {
  serializeCategory,
  serializePatient,
  serializeAppointment,
  serializeInvoice,
  mapPortalAppointmentsFromRows,
} from "@/lib/serializers";
import { patientDetailInclude, patientUserPick } from "@/lib/patient-api-include";
import { getInsightsData, type InsightsPayload } from "@/lib/insights-data";
import { resolveTreatingPhysicianUserId } from "@/lib/appointment-display-doctor";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import type {
  Category,
  Patient,
  PatientSnapshot,
  User,
  DoctorPortalData,
  AdminPortalData,
  DoctorRow,
  AppointmentType,
  DoctorAppointmentTypeConfig,
} from "@/types/types";
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
  appointments: ReturnType<typeof mapPortalAppointmentsFromRows>;
  patient: Patient | null;
  message?: string;
  /** Same as GET /api/patient-portal — OAuth profile image for avatar parity with client fetch */
  userImage?: string | null;
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
 * Includes calendar owner + B2 treating physician joins (same projection as GET snapshot).
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
        appointment_type: { select: { name: true } },
        owner: { select: { id: true, display_name: true, email: true } },
        treating_physician: { select: { id: true, display_name: true, email: true } },
      },
    });

    const appointmentIds = appointmentsRaw.map((a) => a.id);

    const invoicesRaw =
      appointmentIds.length === 0
        ? []
        : await prisma.invoice.findMany({
            where: { appointment_id: { in: appointmentIds } },
            orderBy: { created_at: "desc" },
          });

    return {
      patient: serializePatient(patientRaw) as Patient,
      appointments: appointmentsRaw.map((a) => {
        const row = serializeAppointment(a);
        const clinicalId = resolveTreatingPhysicianUserId(row);
        const clinical =
          a.treating_physician_id && a.treating_physician?.id === clinicalId
            ? a.treating_physician
            : a.owner;
        return {
          ...row,
          category_label: a.category?.label ?? null,
          category_color: a.category?.color ?? null,
          appointment_type_name: a.appointment_type?.name ?? null,
          calendar_owner_id: a.owner?.id ?? null,
          calendar_owner_display: a.owner?.display_name ?? null,
          calendar_owner_email: a.owner?.email ?? null,
          doctor_id: clinical?.id ?? null,
          doctor_display: clinical?.display_name ?? null,
          doctor_email: clinical?.email ?? null,
        };
      }),
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
      prisma.appointment.count({ where: { owner_id: userId } }),
      prisma.appointment.count({ where: { owner_id: userId, start: { gte: todayStart, lte: todayEnd } } }),
      prisma.appointment.count({ where: { owner_id: userId, start: { gte: weekStart, lte: weekEnd } } }),
      prisma.appointment.count({ where: { owner_id: userId, start: { gte: monthStart, lte: monthEnd } } }),
      prisma.appointment.count({ where: { owner_id: userId, status: "done" } }),
      prisma.appointment.count({ where: { owner_id: userId, status: "pending" } }),
      prisma.appointment.count({ where: { owner_id: userId, status: "alert" } }),
      prisma.patient.count(),
      prisma.patient.count({ where: { active: true } }),
      prisma.user.count({ where: { role: "doctor" } }),
      prisma.category.count(),
      prisma.appointment.findFirst({
        where: { owner_id: userId, start: { gt: now }, status: { not: "done" } },
        orderBy: { start: "asc" },
        select: { id: true, title: true, start: true, end: true, location: true },
      }),
      prisma.appointment.findMany({
        where: { owner_id: userId },
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
        where: { owner_id: userId, end: { lt: now }, status: { not: "done" } },
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
 * Pass ownOnly = true for doctor role so the SSR cache matches what the API route returns.
 */
export async function prefetchInsights(
  userId: string,
  opts: { ownOnly?: boolean } = {}
): Promise<InsightsPayload | null> {
  try {
    return await getInsightsData(userId, opts);
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

/**
 * Mirrors GET /api/appointment-types/catalog — global + deduped additional types for `/services`.
 * Cache key: queryKeys.appointmentTypes.catalog → `{ services: ServiceCatalogRow[] }`.
 */
export async function prefetchAppointmentServiceCatalog(): Promise<ServiceCatalogRow[] | null> {
  try {
    const typeSelect = {
      id: true,
      name: true,
      description: true,
      duration_minutes: true,
      slot_interval_minutes: true,
      is_telehealth: true,
      user_id: true,
    } as const;

    const [globalRows, additionalRaw] = await Promise.all([
      prisma.appointmentType.findMany({
        where: { user_id: null, is_active: true },
        select: typeSelect,
        orderBy: [{ duration_minutes: "asc" }, { name: "asc" }],
      }),
      prisma.appointmentType.findMany({
        where: { user_id: { not: null }, is_active: true },
        select: {
          ...typeSelect,
          user: { select: { id: true, display_name: true, email: true, specialty: true } },
        },
        orderBy: [{ duration_minutes: "asc" }, { name: "asc" }],
      }),
    ]);

    const globals: GlobalCatalogInput[] = globalRows.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      duration_minutes: g.duration_minutes,
      slot_interval_minutes: g.slot_interval_minutes,
      is_telehealth: g.is_telehealth,
    }));

    const additionals: AdditionalCatalogInput[] = additionalRaw
      .filter((r): r is typeof r & { user_id: string; user: NonNullable<typeof r.user> } =>
        Boolean(r.user_id && r.user)
      )
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        duration_minutes: r.duration_minutes,
        slot_interval_minutes: r.slot_interval_minutes,
        is_telehealth: r.is_telehealth,
        user_id: r.user_id,
        owner_display_name: r.user.display_name,
        owner_email: r.user.email,
        owner_specialty: r.user.specialty,
      }));

    return buildServiceCatalog(globals, additionals);
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

    const patientRow = await prisma.patient.findFirst({
      where: { email: user.email },
      include: patientDetailInclude,
    });
    if (!patientRow) {
      return {
        appointments: [],
        patient: null,
        message: "No patient record found for your email",
        userImage: user.image ?? null,
      };
    }

    const appointmentsRaw = await prisma.appointment.findMany({
      where: { patient_id: patientRow.id },
      include: {
        category: true,
        owner: { select: { id: true, display_name: true, email: true, role: true } },
        treating_physician: { select: { id: true, display_name: true, email: true, role: true } },
      },
      orderBy: { start: "desc" },
    });

    return {
      appointments: mapPortalAppointmentsFromRows(appointmentsRaw),
      patient: serializePatient(patientRow) as Patient,
      userImage: user.image ?? null,
    };
  } catch {
    return null;
  }
}

// ─── Doctor portal ────────────────────────────────────────────────────────────

/**
 * Mirrors GET /api/doctor-portal.
 * Cache key: queryKeys.doctorPortal.all → stores DoctorPortalData.
 * Called by the doctor-portal SSR page to seed the TanStack Query cache before first paint.
 */
export async function prefetchDoctorPortal(userId: string): Promise<DoctorPortalData | null> {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
      doctor,
      todayAppts,
      upcomingAppts,
      patients,
      globalTypes,
      typeConfigs,
      metricToday,
      metricWeek,
      metricMonth,
      metricPending,
      metricDone,
      metricOverdue,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true, email: true, display_name: true, image: true, role: true,
          specialty: true, bio: true, phone: true, license_number: true,
          department: true, consultation_fee: true, office_location: true,
          languages_spoken: true, years_of_experience: true, created_at: true,
        },
      }),
      prisma.appointment.findMany({
        where: { owner_id: userId, start: { gte: todayStart, lte: todayEnd } },
        orderBy: { start: "asc" },
      }),
      prisma.appointment.findMany({
        where: { owner_id: userId, start: { gt: todayEnd }, status: { not: "done" } },
        orderBy: { start: "asc" },
        take: 20,
      }),
      prisma.patient.findMany({
        where: { primary_doctor_id: userId },
        orderBy: { firstname: "asc" },
        take: 50,
      }),
      prisma.appointmentType.findMany({
        where: { user_id: null, is_active: true },
        orderBy: { name: "asc" },
      }),
      prisma.doctorAppointmentTypeConfig.findMany({
        where: { doctor_id: userId },
        select: { id: true, doctor_id: true, appointment_type_id: true, is_enabled: true, created_at: true },
      }),
      prisma.appointment.count({ where: { owner_id: userId, start: { gte: todayStart, lte: todayEnd } } }),
      prisma.appointment.count({ where: { owner_id: userId, start: { gte: weekStart, lte: weekEnd } } }),
      prisma.appointment.count({ where: { owner_id: userId, start: { gte: monthStart, lte: monthEnd } } }),
      prisma.appointment.count({ where: { owner_id: userId, status: "pending" } }),
      prisma.appointment.count({ where: { owner_id: userId, status: "done" } }),
      prisma.appointment.count({ where: { owner_id: userId, end: { lt: now }, status: { not: "done" } } }),
    ]);

    if (!doctor) return null;

    const configMap = new Map(typeConfigs.map((c) => [c.appointment_type_id, c.is_enabled]));
    const mapType = (t: typeof globalTypes[number]): AppointmentType => ({
      id: t.id,
      created_at: t.created_at.toISOString(),
      user_id: t.user_id,
      name: t.name,
      description: t.description,
      duration_minutes: t.duration_minutes,
      buffer_before_minutes: t.buffer_before_minutes,
      buffer_after_minutes: t.buffer_after_minutes,
      slot_interval_minutes: t.slot_interval_minutes,
      minimum_notice_minutes: t.minimum_notice_minutes,
      is_telehealth: t.is_telehealth,
      color: t.color,
      icon: t.icon,
      is_active: t.is_active,
      is_enabled: configMap.get(t.id) ?? true,
    });

    return {
      doctor: {
        id: doctor.id,
        email: doctor.email,
        display_name: doctor.display_name,
        image: doctor.image,
        role: doctor.role,
        specialty: doctor.specialty,
        bio: doctor.bio,
        phone: doctor.phone,
        license_number: doctor.license_number,
        department: doctor.department,
        consultation_fee: doctor.consultation_fee,
        office_location: doctor.office_location,
        languages_spoken: doctor.languages_spoken,
        years_of_experience: doctor.years_of_experience,
        created_at: doctor.created_at.toISOString(),
      } as User,
      todayAppointments: todayAppts.map(serializeAppointment),
      upcomingAppointments: upcomingAppts.map(serializeAppointment),
      patients: patients.map(serializePatient) as Patient[],
      enabledTypes: globalTypes.filter((t) => configMap.get(t.id) !== false).map(mapType),
      allGlobalTypes: globalTypes.map(mapType),
      typeConfigs: typeConfigs.map((c) => ({
        ...c,
        created_at: c.created_at.toISOString(),
      })) as DoctorAppointmentTypeConfig[],
      metrics: {
        today: metricToday,
        thisWeek: metricWeek,
        thisMonth: metricMonth,
        pending: metricPending,
        done: metricDone,
        overdue: metricOverdue,
      },
    };
  } catch {
    return null;
  }
}

// ─── Admin portal ─────────────────────────────────────────────────────────────

/**
 * Mirrors GET /api/admin-portal.
 * Cache key: queryKeys.adminPortal.all → stores AdminPortalData.
 */
export async function prefetchAdminPortal(): Promise<AdminPortalData | null> {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [
      totalAppointments,
      todayCount,
      pendingCount,
      overdueCount,
      totalPatients,
      totalDoctors,
      doctors,
      recentAppointments,
      paidAgg,
      outstandingAgg,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { start: { gte: todayStart, lte: todayEnd } } }),
      prisma.appointment.count({ where: { status: "pending" } }),
      prisma.appointment.count({ where: { end: { lt: now }, status: { not: "done" } } }),
      prisma.patient.count(),
      prisma.user.count({ where: { role: "doctor" } }),
      prisma.user.findMany({
        where: { role: "doctor" },
        select: {
          id: true, email: true, display_name: true, image: true, specialty: true,
          bio: true, phone: true, license_number: true, consultation_fee: true,
          languages_spoken: true, years_of_experience: true, office_location: true,
          department: true, created_at: true,
          doctor_availabilities: { select: { weekday: true, start_min: true, end_min: true, timezone: true } },
          appointment_types_owned: {
            where: { is_active: true },
            select: { id: true, name: true, duration_minutes: true, is_telehealth: true },
          },
          patients_primary_doctor: { select: { id: true } },
        },
        orderBy: { display_name: "asc" },
      }),
      prisma.appointment.findMany({
        orderBy: { created_at: "desc" },
        take: 15,
      }),
      prisma.invoice.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
      prisma.invoice.aggregate({ where: { status: { in: ["draft", "sent"] } }, _sum: { amount: true } }),
    ]);

    return {
      overview: {
        totalAppointments,
        todayAppointments: todayCount,
        totalPatients,
        totalDoctors,
        pendingAppointments: pendingCount,
        overdueAppointments: overdueCount,
        paidRevenueCents: paidAgg._sum.amount ?? 0,
        outstandingRevenueCents: outstandingAgg._sum.amount ?? 0,
      },
      doctors: doctors.map((d) => ({
        id: d.id,
        email: d.email,
        display_name: d.display_name,
        image: d.image,
        specialty: d.specialty,
        bio: d.bio,
        phone: d.phone,
        license_number: d.license_number,
        consultation_fee: d.consultation_fee,
        languages_spoken: d.languages_spoken,
        years_of_experience: d.years_of_experience,
        office_location: d.office_location,
        department: d.department,
        created_at: d.created_at.toISOString(),
        availabilities: d.doctor_availabilities,
        appointment_types: d.appointment_types_owned as Pick<AppointmentType, "id" | "name" | "duration_minutes" | "is_telehealth">[],
        patient_count: d.patients_primary_doctor.length,
      })) as DoctorRow[],
      recentAppointments: recentAppointments.map(serializeAppointment),
    };
  } catch {
    return null;
  }
}
