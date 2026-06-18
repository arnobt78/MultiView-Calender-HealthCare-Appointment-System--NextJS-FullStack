/**
 * Cross-tab TanStack Query invalidation — BroadcastChannel + localStorage fallback.
 * Mutating tab invalidates locally via query-client helpers, then publishes scopes so
 * other tabs call applyCrossTabScopes without re-broadcasting (tabId echo guard).
 */

import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { InvoiceRow } from "@/lib/billing-types";
import type { AppointmentCrossTabMergePayload } from "@/lib/appointment-detail-api";

export type QueryCacheCrossTabScope =
  | "app"
  | "insights"
  | "analytics"
  | "appointments"
  | "patients"
  | "categories"
  | "dashboard"
  | "doctorPortal"
  | "adminPortal"
  | "patientPortal"
  | "doctors"
  | "users"
  | "auth"
  | "availability"
  | "appointmentTypes"
  | "invoices"
  | "notifications"
  | "assignees"
  | "invitations"
  | "dashboardAccess"
  | "organizations"
  | "googleCalendar";

/** Shared scope sets — keep in sync with top-level invalidation helpers in query-client.ts */
export const CROSS_TAB_SCOPES = {
  APPOINTMENT_MUTATION: [
    "appointments",
    "notifications",
    "appointmentTypes",
    "availability",
    "doctors",
    "invoices",
    "insights",
    "analytics",
    "patientPortal",
    "doctorPortal",
    "adminPortal",
    "dashboard",
    "patients",
    "categories",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  /** Status toggle/cancel — skips invoices + appointmentTypes directory refetch. */
  APPOINTMENT_STATUS: [
    "appointments",
    "notifications",
    "patientPortal",
    "doctorPortal",
    "adminPortal",
    "dashboard",
    "insights",
    "analytics",
    "patients",
    "categories",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  /** Create/reschedule — adds availability + appointmentTypes; still skips invoices. */
  APPOINTMENT_SCHEDULE: [
    "appointments",
    "notifications",
    "appointmentTypes",
    "availability",
    "patientPortal",
    "doctorPortal",
    "adminPortal",
    "dashboard",
    "insights",
    "analytics",
    "patients",
    "categories",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  /** Cache-first status write — portals + KPIs; appointment row merged cross-tab. */
  APPOINTMENT_STATUS_SYNC: [
    "notifications",
    "patientPortal",
    "doctorPortal",
    "adminPortal",
    "dashboard",
    "insights",
    "analytics",
    "patients",
    "categories",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  /** Cache-first schedule write — adds availability + appointmentTypes. */
  APPOINTMENT_SCHEDULE_SYNC: [
    "notifications",
    "appointmentTypes",
    "availability",
    "patientPortal",
    "doctorPortal",
    "adminPortal",
    "dashboard",
    "insights",
    "analytics",
    "patients",
    "categories",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  /** Cache-first delete — adds invoices prefix for billing-linked overview. */
  APPOINTMENT_BILLING_SYNC: [
    "notifications",
    "appointmentTypes",
    "availability",
    "invoices",
    "patientPortal",
    "doctorPortal",
    "adminPortal",
    "dashboard",
    "insights",
    "analytics",
    "patients",
    "categories",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  ENTITY_PATIENTS: [
    "patients",
    "appointments",
    "dashboard",
    "insights",
    "analytics",
    "doctorPortal",
    "adminPortal",
    "patientPortal",
    "doctors",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  ENTITY_CATEGORIES: [
    "categories",
    "appointments",
    "dashboard",
    "insights",
    "analytics",
    "doctorPortal",
    "adminPortal",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  SHARING: [
    "invitations",
    "dashboardAccess",
    "assignees",
    "appointments",
    "insights",
    "analytics",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  USERS_AND_AUTH: [
    "users",
    "auth",
    "doctors",
    "appointmentTypes",
    "insights",
    "analytics",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  INVOICES: ["invoices", "dashboard", "insights", "analytics", "patients"] as const satisfies readonly QueryCacheCrossTabScope[],

  /** Legacy broad bust — SSE + callers without cache merge (still includes invoices prefix). */
  INVOICES_BILLING: [
    "invoices",
    "dashboard",
    "patientPortal",
    "doctorPortal",
    "adminPortal",
    "patients",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  /** Cache-first billing write — portals + dashboard only; invoice row merged cross-tab. */
  INVOICES_BILLING_SYNC: [
    "dashboard",
    "patientPortal",
    "doctorPortal",
    "adminPortal",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  /** Cache-first full invoice write — adds insights/analytics/doctors. */
  INVOICES_FULL_SYNC: [
    "dashboard",
    "patientPortal",
    "doctorPortal",
    "adminPortal",
    "insights",
    "analytics",
    "doctors",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  APPOINTMENT_TYPE_DERIVED: [
    "appointmentTypes",
    "availability",
    "doctors",
    "doctorPortal",
    "insights",
    "analytics",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  DOCTOR_SCHEDULE: [
    "doctors",
    "availability",
    "doctorPortal",
    "insights",
    "analytics",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  ASSIGNEES: [
    "assignees",
    "appointments",
    "appointmentTypes",
    "availability",
    "doctors",
    "insights",
    "analytics",
    "doctorPortal",
    "adminPortal",
    "patients",
    "patientPortal",
  ] as const satisfies readonly QueryCacheCrossTabScope[],

  INSIGHTS_ONLY: ["insights", "analytics"] as const satisfies readonly QueryCacheCrossTabScope[],

  /** Org CRUD — member lists + dashboard KPIs that reference org counts */
  ORGANIZATIONS: ["organizations", "dashboard"] as const satisfies readonly QueryCacheCrossTabScope[],

  APP_ROOT: ["app"] as const satisfies readonly QueryCacheCrossTabScope[],
} as const;

const BROADCAST_CHANNEL_NAME = "cal-appt-query-invalidate";
const STORAGE_KEY = "cal-appt-query-invalidate";
const TAB_ID_STORAGE_KEY = "cal-appt-query-tab-id";

export type QueryCacheCrossTabMessage = {
  tabId: string;
  scopes: QueryCacheCrossTabScope[];
  ts: number;
  /** Listening tabs merge row without busting invoices.all prefix. */
  invoiceMerge?: InvoiceRow;
  /** Listening tabs remove row from warm list caches when DELETE propagates. */
  invoiceRemovedId?: string;
  /** Listening tabs merge appointment without busting appointments.all prefix. */
  appointmentMerge?: AppointmentCrossTabMergePayload;
  /** Listening tabs remove appointment from warm list caches when DELETE propagates. */
  appointmentRemovedId?: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getLocalTabId(): string {
  if (!isBrowser()) return "ssr";
  try {
    let id = sessionStorage.getItem(TAB_ID_STORAGE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(TAB_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `tab-${Date.now()}`;
  }
}

function dedupeScopes(scopes: readonly QueryCacheCrossTabScope[]): QueryCacheCrossTabScope[] {
  return [...new Set(scopes)];
}

function scopeToQueryKey(scope: QueryCacheCrossTabScope): readonly unknown[] {
  switch (scope) {
    case "app":
      return queryKeys.root;
    case "insights":
      return queryKeys.insights.root;
    case "analytics":
      return queryKeys.analytics.all;
    case "appointments":
      return queryKeys.appointments.all;
    case "patients":
      return queryKeys.patients.all;
    case "categories":
      return queryKeys.categories.all;
    case "dashboard":
      return queryKeys.dashboard.overview;
    case "doctorPortal":
      return queryKeys.doctorPortal.all;
    case "adminPortal":
      return queryKeys.adminPortal.all;
    case "patientPortal":
      return queryKeys.patientPortal.all;
    case "doctors":
      return queryKeys.doctors.all;
    case "users":
      return queryKeys.users.all;
    case "auth":
      return queryKeys.auth.me;
    case "availability":
      return queryKeys.availability.root;
    case "appointmentTypes":
      return queryKeys.appointmentTypes.all;
    case "invoices":
      return queryKeys.invoices.all;
    case "notifications":
      return queryKeys.notifications.all;
    case "assignees":
      return queryKeys.assignees.all;
    case "invitations":
      return queryKeys.invitations.all;
    case "dashboardAccess":
      return queryKeys.dashboardAccess.all;
    case "organizations":
      return queryKeys.organizations.all;
    case "googleCalendar":
      return queryKeys.googleCalendar.root;
    default: {
      const _exhaustive: never = scope;
      return _exhaustive;
    }
  }
}

/** Apply invalidation in the listening tab — does not publish. */
export async function applyCrossTabScopes(
  queryClient: QueryClient,
  scopes: readonly QueryCacheCrossTabScope[]
): Promise<void> {
  const unique = dedupeScopes(scopes);
  if (unique.includes("app")) {
    await queryClient.invalidateQueries({ queryKey: queryKeys.root });
    return;
  }
  await Promise.all(
    unique.map((scope) =>
      queryClient.invalidateQueries({ queryKey: scopeToQueryKey(scope) })
    )
  );
}

function parseMessage(raw: unknown): QueryCacheCrossTabMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const msg = raw as Partial<QueryCacheCrossTabMessage>;
  if (typeof msg.tabId !== "string") return null;
  const scopes = Array.isArray(msg.scopes)
    ? msg.scopes.filter(
        (s): s is QueryCacheCrossTabScope =>
          typeof s === "string" && isQueryCacheCrossTabScope(s)
      )
    : [];
  const hasInvoicePayload =
    (msg.invoiceMerge != null && typeof msg.invoiceMerge === "object") ||
    typeof msg.invoiceRemovedId === "string";
  const hasAppointmentPayload =
    (msg.appointmentMerge != null && typeof msg.appointmentMerge === "object") ||
    typeof msg.appointmentRemovedId === "string";
  if (scopes.length === 0 && !hasInvoicePayload && !hasAppointmentPayload) return null;
  return {
    tabId: msg.tabId,
    scopes,
    ts: typeof msg.ts === "number" ? msg.ts : Date.now(),
    invoiceMerge:
      msg.invoiceMerge != null && typeof msg.invoiceMerge === "object"
        ? (msg.invoiceMerge as InvoiceRow)
        : undefined,
    invoiceRemovedId:
      typeof msg.invoiceRemovedId === "string" ? msg.invoiceRemovedId : undefined,
    appointmentMerge:
      msg.appointmentMerge != null && typeof msg.appointmentMerge === "object"
        ? (msg.appointmentMerge as AppointmentCrossTabMergePayload)
        : undefined,
    appointmentRemovedId:
      typeof msg.appointmentRemovedId === "string" ? msg.appointmentRemovedId : undefined,
  };
}

function isQueryCacheCrossTabScope(value: string): value is QueryCacheCrossTabScope {
  return (
    value === "app" ||
    value === "insights" ||
    value === "analytics" ||
    value === "appointments" ||
    value === "patients" ||
    value === "categories" ||
    value === "dashboard" ||
    value === "doctorPortal" ||
    value === "adminPortal" ||
    value === "patientPortal" ||
    value === "doctors" ||
    value === "users" ||
    value === "auth" ||
    value === "availability" ||
    value === "appointmentTypes" ||
    value === "invoices" ||
    value === "notifications" ||
    value === "assignees" ||
    value === "invitations" ||
    value === "dashboardAccess" ||
    value === "organizations" ||
    value === "googleCalendar"
  );
}

/** One BroadcastChannel per tab for publish + listen — avoids alloc/close on every mutation. */
let sharedChannel: BroadcastChannel | null = null;
const subscribers = new Set<QueryCacheCrossTabHandler>();
let storageListenerAttached = false;
let pagehideListenerAttached = false;

function dispatchToSubscribers(msg: QueryCacheCrossTabMessage): void {
  if (msg.tabId === getLocalTabId()) return;
  for (const handler of subscribers) {
    handler(msg);
  }
}

function onSharedChannelMessage(event: MessageEvent): void {
  const parsed = parseMessage(event.data);
  if (parsed) dispatchToSubscribers(parsed);
}

function onCrossTabStorageEvent(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  try {
    const parsed = parseMessage(JSON.parse(event.newValue) as unknown);
    if (parsed) dispatchToSubscribers(parsed);
  } catch {
    // ignore malformed payloads
  }
}

function onPageHide(): void {
  releaseQueryCacheCrossTabBus(true);
}

/** Lazy singleton — used by publish and subscribe. */
function ensureSharedChannel(): BroadcastChannel | null {
  if (!isBrowser() || typeof BroadcastChannel === "undefined") return null;
  if (sharedChannel) return sharedChannel;

  try {
    sharedChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    sharedChannel.onmessage = onSharedChannelMessage;

    if (!pagehideListenerAttached) {
      window.addEventListener("pagehide", onPageHide);
      pagehideListenerAttached = true;
    }

    return sharedChannel;
  } catch {
    sharedChannel = null;
    return null;
  }
}

function attachStorageListener(): void {
  if (!isBrowser() || storageListenerAttached) return;
  window.addEventListener("storage", onCrossTabStorageEvent);
  storageListenerAttached = true;
}

function detachStorageListener(): void {
  if (!isBrowser() || !storageListenerAttached) return;
  window.removeEventListener("storage", onCrossTabStorageEvent);
  storageListenerAttached = false;
}

/**
 * Tear down bus on pagehide (force) or when the last subscriber unsubscribes.
 * Publish-only calls may leave the channel open until navigation — low overhead.
 */
export function releaseQueryCacheCrossTabBus(force = false): void {
  if (force) {
    subscribers.clear();
  } else if (subscribers.size > 0) {
    return;
  }

  detachStorageListener();

  if (sharedChannel) {
    try {
      sharedChannel.close();
    } catch {
      // already closed
    }
    sharedChannel = null;
  }

  if (pagehideListenerAttached && force) {
    window.removeEventListener("pagehide", onPageHide);
    pagehideListenerAttached = false;
  }
}

function postMessagePayload(msg: QueryCacheCrossTabMessage): void {
  if (!isBrowser()) return;

  const json = JSON.stringify(msg);

  try {
    ensureSharedChannel()?.postMessage(msg);
  } catch {
    // Safari private mode / disabled APIs — storage fallback below
  }

  try {
    localStorage.setItem(STORAGE_KEY, json);
  } catch {
    // Quota / private browsing — local tab invalidation still ran
  }
}

/** Notify other browser tabs after local invalidation completes. */
export function publishQueryCacheCrossTab(
  scopes: readonly QueryCacheCrossTabScope[]
): void {
  if (!isBrowser()) return;
  const unique = dedupeScopes(scopes);
  if (unique.length === 0) return;

  postMessagePayload({
    tabId: getLocalTabId(),
    scopes: unique,
    ts: Date.now(),
  });
}

/** Cache-first invoice write — merge row in other tabs; narrow scope invalidation only. */
export function publishInvoiceMergeCrossTab(
  invoice: InvoiceRow,
  opts: { scope: "billing" | "full"; patientId?: string }
): void {
  if (!isBrowser()) return;
  const scopes: QueryCacheCrossTabScope[] =
    opts.scope === "full"
      ? [...CROSS_TAB_SCOPES.INVOICES_FULL_SYNC]
      : [...CROSS_TAB_SCOPES.INVOICES_BILLING_SYNC];
  if (opts.scope === "full" && !opts.patientId) {
    scopes.push("patients");
  }
  postMessagePayload({
    tabId: getLocalTabId(),
    scopes: dedupeScopes(scopes),
    ts: Date.now(),
    invoiceMerge: invoice,
  });
}

/** Invoice DELETE — remove from warm caches in other tabs without full list refetch. */
export function publishInvoiceRemoveCrossTab(
  invoiceId: string,
  opts: { scope: "billing" | "full"; patientId?: string }
): void {
  if (!isBrowser()) return;
  const scopes: QueryCacheCrossTabScope[] =
    opts.scope === "full"
      ? [...CROSS_TAB_SCOPES.INVOICES_FULL_SYNC]
      : [...CROSS_TAB_SCOPES.INVOICES_BILLING_SYNC];
  if (opts.scope === "full" && !opts.patientId) {
    scopes.push("patients");
  }
  postMessagePayload({
    tabId: getLocalTabId(),
    scopes: dedupeScopes(scopes),
    ts: Date.now(),
    invoiceRemovedId: invoiceId,
  });
}

function appointmentSyncScopesForScope(
  scope: "status" | "schedule" | "billing"
): readonly QueryCacheCrossTabScope[] {
  if (scope === "status") return CROSS_TAB_SCOPES.APPOINTMENT_STATUS_SYNC;
  if (scope === "billing") return CROSS_TAB_SCOPES.APPOINTMENT_BILLING_SYNC;
  return CROSS_TAB_SCOPES.APPOINTMENT_SCHEDULE_SYNC;
}

/** Cache-first appointment write — merge row in other tabs; narrow scope invalidation only. */
export function publishAppointmentMergeCrossTab(
  payload: AppointmentCrossTabMergePayload,
  opts: { scope: "status" | "schedule" | "billing"; patientId?: string }
): void {
  if (!isBrowser()) return;
  const scopes: QueryCacheCrossTabScope[] = [...appointmentSyncScopesForScope(opts.scope)];
  if (!opts.patientId) {
    scopes.push("patients");
  }
  postMessagePayload({
    tabId: getLocalTabId(),
    scopes: dedupeScopes(scopes),
    ts: Date.now(),
    appointmentMerge: payload,
  });
}

/** Appointment DELETE — remove from warm caches in other tabs without full list refetch. */
export function publishAppointmentRemoveCrossTab(
  appointmentId: string,
  opts: { scope: "status" | "schedule" | "billing"; patientId?: string }
): void {
  if (!isBrowser()) return;
  const scopes: QueryCacheCrossTabScope[] = [...appointmentSyncScopesForScope(opts.scope)];
  if (!opts.patientId) {
    scopes.push("patients");
  }
  postMessagePayload({
    tabId: getLocalTabId(),
    scopes: dedupeScopes(scopes),
    ts: Date.now(),
    appointmentRemovedId: appointmentId,
  });
}

export type QueryCacheCrossTabHandler = (message: QueryCacheCrossTabMessage) => void;

/**
 * Subscribe to cross-tab invalidation messages. Returns cleanup.
 * Shares the tab's singleton BroadcastChannel with publishQueryCacheCrossTab.
 */
export function subscribeQueryCacheCrossTab(
  onMessage: QueryCacheCrossTabHandler
): () => void {
  if (!isBrowser()) return () => {};

  subscribers.add(onMessage);
  ensureSharedChannel();
  attachStorageListener();

  return () => {
    subscribers.delete(onMessage);
    releaseQueryCacheCrossTabBus();
  };
}
