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
import { mergeBookableTypesForDoctor } from "@/lib/doctor-bookable-types";
import {
  fetchPaidRevenueCentsByDoctorIds,
  resolveDoctorPaidRevenueCents,
} from "@/lib/doctor-revenue-aggregate";
import { PAGINATION } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import {
  serializeCategory,
  serializePatient,
  serializeAppointment,
  serializeInvoice,
  serializeUser,
  mapPortalAppointmentsFromRows,
} from "@/lib/serializers";
import type { UsersListResponse } from "@/hooks/useUsers";
import { patientDetailInclude, patientUserPick } from "@/lib/patient-api-include";
import { USER_API_SELECT } from "@/lib/user-api-select";
import { getInsightsData, type InsightsPayload } from "@/lib/insights-data";
import { fetchInsightsWithRedisCache } from "@/lib/insights/insights-redis-cache";
import {
  resolveInsightsDataOptions,
  type InsightsQueryKey,
} from "@/lib/insights-scope";
import {
  appointmentSnapshotInclude,
  mapAppointmentToSnapshotRow,
  type AppointmentSnapshotPrismaRow,
} from "@/lib/appointment-snapshot-row";
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
  CategorySnapshot,
  Patient,
  PatientSnapshot,
  User,
  DoctorPortalData,
  AdminPortalData,
  DoctorRow,
  AppointmentType,
  DoctorAppointmentTypeConfig,
  Appointment,
  AppointmentAssignee,
} from "@/types/types";
import type { DashboardOverview } from "@/hooks/useDashboardOverview";
import {
  coerceDashboardOverviewPayload,
  mapDashboardOverviewRecentQueueAppointment,
  DASHBOARD_UPCOMING_APPOINTMENTS_LIMIT,
  dashboardOverviewAppointmentQueueSelect,
  mapDashboardOverviewQueueAppointment,
} from "@/lib/dashboard-overview-queue";
import {
  DASHBOARD_RECENT_ACTIVITY_FETCH_CAP,
  dashboardOverviewRecentQueueSelect,
  pickRecentActivityAppointments,
} from "@/lib/dashboard-overview-recent-activity";
import { loadCategorySnapshotData } from "@/lib/category-snapshot-data";
import { categoryDetailInclude } from "@/lib/category-api-include";
import type { DashboardAccessRow } from "@/lib/query-fetchers";
import { buildFullAppointmentsList } from "@/lib/appointments-list-build";
import { resolveExtraAssignedAppointmentIds } from "@/lib/appointments-calendar-assignees";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { Invoice } from "@/hooks/usePayments";
import type { Organization } from "@/hooks/useOrganization";
import { getUserRole, isPatientRole } from "@/lib/rbac";

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

// ─── Organizations ────────────────────────────────────────────────────────────

/** Mirrors GET /api/organizations — cache key: queryKeys.organizations.all */
export async function prefetchOrganizations(
  userId: string
): Promise<Organization[] | null> {
  try {
    const memberships = await prisma.organizationMember.findMany({
      where: { user_id: userId },
      include: { organization: true },
    });
    return memberships.map((m) => ({
      ...m.organization,
      role: m.role,
      created_at: m.organization.created_at.toISOString(),
    })) as Organization[];
  } catch {
    return null;
  }
}

// ─── Dashboard calendar appointments ─────────────────────────────────────────

/** Same projection as GET /api/appointment-assignees (global, no appointment_id). */
function serializeAppointmentAssigneeRow(a: {
  id: string;
  created_at: Date;
  appointment_id: string;
  user_id: string | null;
  user_type: string | null;
  invited_email: string | null;
  status: string | null;
  permission: string | null;
  invited_by_id: string | null;
}): AppointmentAssignee {
  return {
    id: a.id,
    created_at: a.created_at?.toISOString?.(),
    appointment: a.appointment_id,
    user: a.user_id,
    user_type: a.user_type,
    invited_email: a.invited_email,
    status: a.status,
    permission: a.permission,
    invited_by: a.invited_by_id,
  } as AppointmentAssignee;
}

/** Mirrors GET /api/appointment-assignees — cache key: queryKeys.assignees.all */
export async function prefetchAppointmentAssigneesForUser(
  userId: string,
  email: string
): Promise<AppointmentAssignee[] | null> {
  try {
    const accessibleAppointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { owner_id: userId },
          {
            assignees: {
              some: {
                OR: [{ user_id: userId }, { invited_email: email }],
                status: "accepted",
              },
            },
          },
        ],
      },
      select: { id: true },
    });

    const appointmentIds = accessibleAppointments.map((a) => a.id);
    if (appointmentIds.length === 0) return [];

    const assignees = await prisma.appointmentAssignee.findMany({
      where: { appointment_id: { in: appointmentIds } },
      orderBy: { created_at: "desc" },
    });

    return assignees.map(serializeAppointmentAssigneeRow);
  } catch {
    return null;
  }
}

/** Mirrors GET /api/dashboard-access?status=accepted — cache key: queryKeys.dashboardAccess.accepted */
export async function prefetchDashboardAccessAccepted(
  userId: string,
  email: string
): Promise<DashboardAccessRow[] | null> {
  try {
    const records = await prisma.dashboardAccess.findMany({
      where: {
        status: "accepted",
        OR: [
          { owner_user_id: userId },
          { invited_user_id: userId },
          { invited_email: email },
        ],
      },
      orderBy: { created_at: "desc" },
    });

    return records.map((d) => ({
      id: d.id,
      created_at: d.created_at?.toISOString?.(),
      owner_user_id: d.owner_user_id,
      invited_user_id: d.invited_user_id,
      invited_email: d.invited_email,
      status: d.status,
      permission: d.permission,
      invited_by: d.invited_by_id,
    }));
  } catch {
    return null;
  }
}

const PATIENT_DASHBOARD_APPOINTMENT_INCLUDE = {
  category: true,
  owner: {
    select: {
      id: true,
      display_name: true,
      email: true,
      role: true,
      image: true,
      specialty: true,
    },
  },
  treating_physician: {
    select: {
      id: true,
      display_name: true,
      email: true,
      role: true,
      image: true,
      specialty: true,
    },
  },
} as const;

/**
 * Mirrors useAppointments join output for /dashboard first paint.
 * Cache key: queryKeys.appointments.all → FullAppointment[].
 * Also seeds assignees when provided via dashboard/page.tsx companion prefetch.
 */
export async function prefetchDashboardAppointments(
  userId: string,
  email: string,
  preloaded?: {
    categories?: Category[] | null;
    patients?: Patient[] | null;
    assignees?: AppointmentAssignee[] | null;
  }
): Promise<FullAppointment[] | null> {
  try {
    const callerRole = await getUserRole(userId);
    const patientCaller = isPatientRole(callerRole);

    const [categories, patients, assignees] = await Promise.all([
      preloaded?.categories != null
        ? Promise.resolve(preloaded.categories)
        : prefetchCategories(),
      preloaded?.patients != null
        ? Promise.resolve(preloaded.patients)
        : prefetchPatients(),
      preloaded?.assignees != null
        ? Promise.resolve(preloaded.assignees)
        : prefetchAppointmentAssigneesForUser(userId, email),
    ]);

    if (categories == null || patients == null || assignees == null) {
      return null;
    }

    let ownedRows: Appointment[] = [];

    if (patientCaller) {
      const userRow = await prisma.user.findUnique({ where: { id: userId } });
      const patientRecord = userRow
        ? await prisma.patient.findFirst({ where: { email: userRow.email } })
        : null;

      if (patientRecord) {
        const rows = await prisma.appointment.findMany({
          where: { patient_id: patientRecord.id },
          orderBy: { start: "asc" },
          take: PAGINATION.CALENDAR_APPOINTMENTS_LIMIT,
          include: PATIENT_DASHBOARD_APPOINTMENT_INCLUDE,
        });
        ownedRows = mapPortalAppointmentsFromRows(
          rows as Parameters<typeof mapPortalAppointmentsFromRows>[0]
        ) as unknown as Appointment[];
      }
    } else {
      const rows = await prisma.appointment.findMany({
        where: { owner_id: userId },
        orderBy: { start: "asc" },
        take: PAGINATION.CALENDAR_APPOINTMENTS_LIMIT,
      });
      ownedRows = rows.map(serializeAppointment) as Appointment[];
    }

    const extraAssignedIds = resolveExtraAssignedAppointmentIds(
      ownedRows,
      assignees,
      userId,
      email
    ).slice(0, PAGINATION.CALENDAR_ASSIGNED_BATCH_LIMIT);

    const assignedRaw =
      extraAssignedIds.length > 0
        ? await prisma.appointment.findMany({
            where: {
              id: { in: extraAssignedIds },
              OR: [
                { owner_id: userId },
                {
                  assignees: {
                    some: {
                      OR: [{ user_id: userId }, { invited_email: email }],
                      status: "accepted",
                    },
                  },
                },
              ],
            },
          })
        : [];

    const serializedAssigned = assignedRaw.map(
      (row) => serializeAppointment(row) as Appointment
    );

    return buildFullAppointmentsList({
      userId,
      userEmail: email,
      userRole: callerRole ?? "",
      categories,
      patients,
      assignees,
      ownedAppointments: ownedRows,
      assignedAppointmentRows: serializedAssigned,
    });
  } catch {
    return null;
  }
}

/** Response shape for GET /api/notifications — cache key: queryKeys.notifications.all */
export type NotificationsPrefetch = {
  notifications: Array<{
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    created_at: string;
    link?: string;
  }>;
  total: number;
  unreadCount: number;
};

/** Mirrors GET /api/invoices/[id] — cache key: queryKeys.invoices.detail(id). */
export async function prefetchInvoiceDetail(
  invoiceId: string,
  userId: string,
  role: string | null,
  email: string
): Promise<Invoice | null> {
  try {
    const { assertInvoiceAccess } = await import("@/lib/invoice-access");
    const { mapApiInvoiceToRow } = await import("@/lib/billing-invoice-map");
    const level = await assertInvoiceAccess(
      { userId, email, role },
      invoiceId,
      "view"
    );
    if (level === "none") return null;
    const raw = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: { orderBy: { created_at: "desc" } } },
    });
    if (!raw) return null;
    const base = serializeInvoice(raw);
    return mapApiInvoiceToRow({
      ...raw,
      ...base,
      appointment_id: raw.appointment_id,
      organization_id: raw.organization_id,
      description: raw.description,
      due_date: base.due_date,
      paid_at: base.paid_at,
      created_at: base.created_at ?? raw.created_at.toISOString(),
      payments: raw.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        created_at: p.created_at,
        stripe_payment_id: p.stripe_payment_id,
      })),
    }) as Invoice;
  } catch {
    return null;
  }
}

/** Mirrors GET /api/payments — cache key: queryKeys.invoices.all → Invoice[] */
export async function prefetchInvoices(
  userId: string,
  role: string | null,
  email?: string | null
): Promise<Invoice[] | null> {
  try {
    const { fetchInvoicesForViewer } = await import("@/lib/invoices-scope");
    const rows = await fetchInvoicesForViewer({ userId, role, email });

    return rows.map((i) => {
      const base = serializeInvoice(i);
      return {
        ...base,
        appointment_id: i.appointment_id ?? undefined,
        description: i.description ?? undefined,
        due_date: base.due_date ?? undefined,
        paid_at: base.paid_at ?? undefined,
        payments: i.payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          created_at: p.created_at?.toISOString?.() ?? "",
          stripe_payment_id: p.stripe_payment_id ?? undefined,
        })),
      } satisfies Invoice;
    });
  } catch {
    return null;
  }
}

/** Mirrors GET /api/notifications — unread-first list + total/unread counts. */
export async function prefetchNotifications(
  userId: string
): Promise<NotificationsPrefetch | null> {
  try {
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: [{ read: "asc" }, { created_at: "desc" }],
        take: 50,
      }),
      prisma.notification.count({ where: { user_id: userId } }),
      prisma.notification.count({
        where: { user_id: userId, read: false },
      }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        user_id: n.user_id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        created_at: n.created_at?.toISOString?.() ?? "",
        link: n.link ?? undefined,
      })),
      total,
      unreadCount,
    };
  } catch {
    return null;
  }
}

/** Bundle seeded for CP appointment-mgmt / telehealth — same keys as dashboard/page.tsx. */
export type CalendarAppointmentsPrefetchBundle = {
  categories: Category[] | null;
  patients: Patient[] | null;
  assignees: AppointmentAssignee[] | null;
  dashboardAccessAccepted: DashboardAccessRow[] | null;
  appointments: FullAppointment[] | null;
};

/**
 * Parallel prefetch for calendar appointment tabs (CP + dashboard pattern).
 * Seeds categories, patients, assignees, dashboardAccess.accepted, appointments.all.
 */
export async function prefetchCalendarAppointmentsBundle(
  userId: string,
  email: string
): Promise<CalendarAppointmentsPrefetchBundle> {
  const [categories, patients, assignees, dashboardAccessAccepted] =
    await Promise.all([
      prefetchCategories(),
      prefetchPatients(),
      prefetchAppointmentAssigneesForUser(userId, email),
      prefetchDashboardAccessAccepted(userId, email),
    ]);

  const appointments = await prefetchDashboardAppointments(userId, email, {
    categories,
    patients,
    assignees,
  });

  return {
    categories,
    patients,
    assignees,
    dashboardAccessAccepted,
    appointments,
  };
}

/** Mirrors GET /api/categories/[id] — seeds `queryKeys.categories.detail(id)`. */
export async function prefetchCategory(id: string): Promise<Category | null> {
  try {
    const row = await prisma.category.findUnique({
      where: { id },
      include: categoryDetailInclude,
    });
    return row ? (serializeCategory(row) as Category) : null;
  } catch {
    return null;
  }
}

/** Mirrors GET /api/categories/:id/snapshot — seeds `queryKeys.categories.snapshot(id)`. */
export async function prefetchCategorySnapshot(
  categoryId: string
): Promise<CategorySnapshot | null> {
  try {
    return await loadCategorySnapshotData(categoryId);
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
    const { loadPatientSnapshotData } = await import("@/lib/patient-snapshot-data");
    return await loadPatientSnapshotData(patientId);
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
      if (cached) {
        return coerceDashboardOverviewPayload(
          JSON.parse(cached as string) as DashboardOverview & {
            nextAppointment?: DashboardOverview["upcomingAppointments"][number] | null;
          }
        );
      }
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
      upcomingAppointmentsRaw,
      recentAppointmentsRaw,
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
      prisma.appointment.findMany({
        where: { owner_id: userId, start: { gt: now }, status: { not: "done" } },
        orderBy: { start: "asc" },
        take: DASHBOARD_UPCOMING_APPOINTMENTS_LIMIT,
        select: dashboardOverviewAppointmentQueueSelect,
      }),
      prisma.appointment.findMany({
        where: { owner_id: userId },
        orderBy: { created_at: "desc" },
        take: DASHBOARD_RECENT_ACTIVITY_FETCH_CAP,
        select: dashboardOverviewRecentQueueSelect,
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
      upcomingAppointments: upcomingAppointmentsRaw.map((a) =>
        mapDashboardOverviewQueueAppointment(a)
      ),
      recentAppointments: pickRecentActivityAppointments(recentAppointmentsRaw).map((a) =>
        mapDashboardOverviewRecentQueueAppointment(a)
      ),
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
 * Mirrors GET /api/insights via getInsightsData + resolveInsightsDataOptions.
 * Seed with queryKeys.insights.filter(filter) on the client — must match SSR filter.
 */
export async function prefetchInsights(
  userId: string,
  opts: {
    query: InsightsQueryKey;
    role: string | null;
  }
): Promise<InsightsPayload | null> {
  try {
    const dataOptions = resolveInsightsDataOptions(userId, opts.query, opts.role);
    const { data } = await fetchInsightsWithRedisCache(userId, opts.query, () =>
      getInsightsData(userId, {
        ...dataOptions,
        period: opts.query.period,
      })
    );
    return data;
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
  bookable_appointment_types: {
    id: string;
    name: string;
    duration_minutes: number;
    description?: string | null;
    is_telehealth?: boolean;
    buffer_before_minutes: number;
    buffer_after_minutes: number;
    slot_interval_minutes: number;
    is_global?: boolean;
  }[];
  patient_count: number;
  is_active?: boolean;
  active_since?: string | null;
  paid_revenue_cents?: number;
};

/**
 * Mirrors GET /api/doctors.
 * Cache key: queryKeys.doctors.all → stores { doctors: DoctorPrefetchRow[] } for ServicesPage.
 * Returns doctors with specialty, bio, availabilities, and patient count.
 */
export async function prefetchDoctors(): Promise<{ doctors: DoctorPrefetchRow[] } | null> {
  try {
    const [rows, globalTypes] = await Promise.all([
      prisma.user.findMany({
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
          is_active: true,
          active_since: true,
          doctor_availabilities: {
            select: { weekday: true, start_min: true, end_min: true, timezone: true },
          },
          appointment_types_owned: {
            where: { user_id: { not: null }, is_active: true },
            select: {
              id: true,
              name: true,
              duration_minutes: true,
              description: true,
              is_telehealth: true,
              buffer_before_minutes: true,
              buffer_after_minutes: true,
              slot_interval_minutes: true,
            },
          },
          _count: { select: { patients_primary_doctor: true } },
        },
        orderBy: [{ display_name: { sort: "asc", nulls: "last" } }, { email: "asc" }],
      }),
      prisma.appointmentType.findMany({
        where: { user_id: null, is_active: true },
        select: {
          id: true,
          name: true,
          duration_minutes: true,
          description: true,
          is_telehealth: true,
          buffer_before_minutes: true,
          buffer_after_minutes: true,
          slot_interval_minutes: true,
          doctor_configs: { select: { doctor_id: true, is_enabled: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const revenueByDoctor = await fetchPaidRevenueCentsByDoctorIds(rows.map((d) => d.id));

    const doctors: DoctorPrefetchRow[] = rows.map((d) => {
      const owned = d.appointment_types_owned;
      const bookable_appointment_types = mergeBookableTypesForDoctor(d.id, owned, globalTypes);
      return {
        id: d.id,
        email: d.email,
        display_name: d.display_name,
        image: d.image,
        specialty: d.specialty,
        bio: d.bio,
        role: d.role,
        created_at: d.created_at.toISOString(),
        is_active: d.is_active,
        active_since: d.active_since?.toISOString() ?? null,
        availabilities: d.doctor_availabilities,
        appointment_types: owned,
        bookable_appointment_types,
        patient_count: d._count.patients_primary_doctor,
        paid_revenue_cents: resolveDoctorPaidRevenueCents(d.id, revenueByDoctor),
      };
    });

    return { doctors };
  } catch {
    return null;
  }
}

/**
 * Mirrors GET /api/users — seeds `useUsers(filters)` on detail pages (doctor/admin portraits).
 */
export async function prefetchUsersList(filters: {
  role?: string;
  roles?: string[];
  limit?: number;
  offset?: number;
}): Promise<UsersListResponse | null> {
  try {
    const limit = Math.min(
      Math.max(filters.limit ?? PAGINATION.DEFAULT_LIMIT, 1),
      PAGINATION.MAX_LIMIT
    );
    const offset = Math.max(filters.offset ?? 0, 0);
    const where =
      filters.roles?.length && filters.roles.length > 0
        ? { role: { in: filters.roles } }
        : filters.role
          ? { role: filters.role }
          : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_API_SELECT,
        orderBy: [{ display_name: { sort: "asc", nulls: "last" } }, { email: "asc" }],
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map(serializeUser),
      pagination: { limit, offset, total, count: users.length },
    };
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
      buffer_before_minutes: true,
      buffer_after_minutes: true,
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
      buffer_before_minutes: g.buffer_before_minutes,
      buffer_after_minutes: g.buffer_after_minutes,
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
        buffer_before_minutes: r.buffer_before_minutes,
        buffer_after_minutes: r.buffer_after_minutes,
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
        owner: {
          select: { id: true, display_name: true, email: true, role: true, image: true, specialty: true },
        },
        treating_physician: {
          select: { id: true, display_name: true, email: true, role: true, image: true, specialty: true },
        },
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
        include: { primary_doctor: patientUserPick },
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
