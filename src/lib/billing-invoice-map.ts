/**
 * Invoice row normalization + TanStack cache patch helpers.
 *
 * - mergeInvoiceIntoScopedListCaches — upsert after create/update (lists)
 * - mergeInvoiceIntoDetailCache — upsert detail row after create/update
 * - mergeInvoiceIntoAllCaches — list + scoped + detail (cache-first writes)
 * - resolvePatientIdFromInvoiceRow — targeted patient invalidation without patients.all
 * - removeInvoiceFromScopedListCaches — remove after delete (lists)
 * - patchScopedTotalsFromListCaches — instant KPI from warm list caches (before invalidation refetch)
 * - syncInvoicesAfterWrite — selective background sync after cache merge (cross-tab via invoice-merge)
 */

import type { QueryClient } from "@tanstack/react-query";
import type {
  InvoiceRow,
  InvoicePaymentRow,
  InvoiceVisitSummary,
} from "@/lib/billing-types";
import { isInvoiceSoftDeleted } from "@/lib/invoice-status-display";
import { queryKeys } from "@/lib/query-keys";
import {
  invoiceMatchesDoctorScope,
  resolveDoctorIdsFromInvoice,
} from "@/lib/invoice-doctor-scope";
import { computeInvoiceBillingManagementPayloadFromList } from "@/lib/invoice-billing-totals";

type ApiPayment = {
  id: string;
  amount: number;
  status: string;
  created_at: string | Date;
  refunded_at?: string | Date | null;
  stripe_payment_id?: string | null;
};

type ApiInvoice = {
  id: string;
  user_id: string;
  appointment_id?: string | null;
  organization_id?: string | null;
  amount: number;
  currency: string;
  status: string;
  description?: string | null;
  due_date?: string | Date | null;
  paid_at?: string | Date | null;
  cancelled_at?: string | Date | null;
  created_at: string | Date;
  updated_at?: string | Date | null;
  created_by_id?: string | null;
  updated_by_id?: string | null;
  created_by_display?: string | null;
  updated_by_display?: string | null;
  created_by_email?: string | null;
  updated_by_email?: string | null;
  created_by_image?: string | null;
  created_by_role?: string | null;
  updated_by_image?: string | null;
  updated_by_role?: string | null;
  issuer_label?: string | null;
  issuer_image?: string | null;
  issuer_email?: string | null;
  issuer_role?: string | null;
  payments?: ApiPayment[];
  visit_summary?: InvoiceVisitSummary;
  visit_detached_at?: string | Date | null;
  visit_snapshot?: unknown;
  visit_detached_by_id?: string | null;
  visit_detached_by_display?: string | null;
  visit_detached_by_email?: string | null;
  visit_detached_by_image?: string | null;
  visit_detached_by_role?: string | null;
  deleted_at?: string | Date | null;
  deleted_by_id?: string | null;
  deleted_by_display?: string | null;
  deleted_by_email?: string | null;
  deleted_by_image?: string | null;
  deleted_by_role?: string | null;
};

type ScopedListCache = { invoices: InvoiceRow[] };

export type PatchScopedTotalsOpts = {
  organizationIds?: readonly string[];
  doctorIds?: readonly string[];
  /** When true, patch viewerTotals from invoices.all if warm. */
  viewerTotals?: boolean;
};

function toIsoDateString(value: string | Date | null | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  return value.toISOString();
}

function mapPayment(p: ApiPayment): InvoicePaymentRow {
  return {
    id: p.id,
    amount: p.amount,
    status: p.status,
    created_at:
      typeof p.created_at === "string"
        ? p.created_at
        : p.created_at.toISOString(),
    refunded_at: toIsoDateString(p.refunded_at) ?? null,
    stripe_payment_id: p.stripe_payment_id ?? undefined,
  };
}

function upsertInvoiceInList(list: InvoiceRow[], invoice: InvoiceRow): InvoiceRow[] {
  const idx = list.findIndex((row) => row.id === invoice.id);
  if (idx >= 0) {
    const next = [...list];
    next[idx] = invoice;
    return next;
  }
  return [invoice, ...list];
}

function removeInvoiceFromList(list: InvoiceRow[], invoiceId: string): InvoiceRow[] {
  return list.filter((row) => row.id !== invoiceId);
}

function patchScopedListCache(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  invoice: InvoiceRow,
  matchesScope: (row: InvoiceRow) => boolean
): void {
  queryClient.setQueryData<ScopedListCache>(queryKey, (old) => {
    const list = old?.invoices ?? [];
    const inScope = matchesScope(invoice);
    const exists = list.some((row) => row.id === invoice.id);
    if (!inScope) {
      if (!exists) return old;
      return { invoices: list.filter((row) => row.id !== invoice.id) };
    }
    return { invoices: upsertInvoiceInList(list, invoice) };
  });
}

function removeFromScopedListCache(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  invoiceId: string
): void {
  queryClient.setQueryData<ScopedListCache>(queryKey, (old) => {
    if (old == null) return old;
    const next = removeInvoiceFromList(old.invoices, invoiceId);
    if (next.length === old.invoices.length) return old;
    return { invoices: next };
  });
}

function patchTotalsFromListIfWarm(
  queryClient: QueryClient,
  totalsKey: readonly unknown[],
  listKey: readonly unknown[]
): void {
  const listCache = queryClient.getQueryData<ScopedListCache>(listKey);
  if (listCache == null) return;
  queryClient.setQueryData(
    totalsKey,
    computeInvoiceBillingManagementPayloadFromList(listCache.invoices)
  );
}

/** Recompute KPI totals from warm scoped list caches — instant UI before server refetch. */
export function patchScopedTotalsFromListCaches(
  queryClient: QueryClient,
  opts: PatchScopedTotalsOpts
): void {
  for (const rawOrgId of opts.organizationIds ?? []) {
    const orgId = rawOrgId.trim();
    if (!orgId) continue;
    patchTotalsFromListIfWarm(
      queryClient,
      queryKeys.invoices.byOrganizationTotals(orgId),
      queryKeys.invoices.byOrganization(orgId)
    );
  }
  for (const rawDoctorId of opts.doctorIds ?? []) {
    const doctorId = rawDoctorId.trim();
    if (!doctorId) continue;
    patchTotalsFromListIfWarm(
      queryClient,
      queryKeys.invoices.byDoctorTotals(doctorId),
      queryKeys.invoices.byDoctor(doctorId)
    );
  }
  if (opts.viewerTotals) {
    const allList = queryClient.getQueryData<InvoiceRow[]>(queryKeys.invoices.all);
    if (allList != null) {
      queryClient.setQueryData(
        queryKeys.invoices.viewerTotals,
        computeInvoiceBillingManagementPayloadFromList(allList)
      );
    }
  }
}

function collectScopedPatchTargets(
  invoice: InvoiceRow,
  previous?: InvoiceRow
): PatchScopedTotalsOpts {
  const orgIds = new Set<string>();
  const doctorIds = new Set<string>();
  const orgId = invoice.organization_id?.trim();
  const previousOrgId = previous?.organization_id?.trim();
  if (orgId) orgIds.add(orgId);
  if (previousOrgId) orgIds.add(previousOrgId);
  for (const id of resolveDoctorIdsFromInvoice(invoice)) doctorIds.add(id);
  if (previous) {
    for (const id of resolveDoctorIdsFromInvoice(previous)) doctorIds.add(id);
  }
  return {
    organizationIds: [...orgIds],
    doctorIds: [...doctorIds],
    viewerTotals: true,
  };
}

/** Detail panel — PATCH response paints immediately without GET /api/invoices/:id. */
export function mergeInvoiceIntoDetailCache(
  queryClient: QueryClient,
  invoice: InvoiceRow
): void {
  queryClient.setQueryData(queryKeys.invoices.detail(invoice.id), invoice);
}

/** Cache-first invoice write — list, scoped KPIs, and detail in one synchronous pass. */
export function mergeInvoiceIntoAllCaches(
  queryClient: QueryClient,
  invoice: InvoiceRow
): void {
  mergeInvoiceIntoScopedListCaches(queryClient, invoice);
  mergeInvoiceIntoDetailCache(queryClient, invoice);
}

function patchInvoiceRowVisitAppointmentStatus(
  row: InvoiceRow,
  appointmentId: string,
  appointmentStatus: string
): InvoiceRow {
  if (row.appointment_id !== appointmentId || !row.visit_summary) return row;
  if (row.visit_summary.appointment_status === appointmentStatus) return row;
  return {
    ...row,
    visit_summary: {
      ...row.visit_summary,
      appointment_status: appointmentStatus,
    },
  };
}

/** Keep invoice list/detail visit_summary status in sync after appointment cancel (portal cards). */
export function patchLinkedInvoiceAppointmentStatusInCaches(
  queryClient: QueryClient,
  appointmentId: string,
  appointmentStatus: string
): void {
  let touched: InvoiceRow[] = [];

  queryClient.setQueryData<InvoiceRow[]>(queryKeys.invoices.all, (old) => {
    if (!old?.length) return old;
    let changed = false;
    const next = old.map((row) => {
      const patched = patchInvoiceRowVisitAppointmentStatus(
        row,
        appointmentId,
        appointmentStatus
      );
      if (patched !== row) {
        changed = true;
        touched.push(patched);
      }
      return patched;
    });
    return changed ? next : old;
  });

  if (!touched.length) {
    touched =
      queryClient
        .getQueryData<InvoiceRow[]>(queryKeys.invoices.all)
        ?.filter((row) => row.appointment_id === appointmentId) ?? [];
    touched = touched.map((row) =>
      patchInvoiceRowVisitAppointmentStatus(row, appointmentId, appointmentStatus)
    );
  }

  for (const invoice of touched) {
    mergeInvoiceIntoScopedListCaches(queryClient, invoice);
    mergeInvoiceIntoDetailCache(queryClient, invoice);
  }
}

/** Prefer invoice row fields before walking appointments cache (avoids patients.all bust). */
export function resolvePatientIdFromInvoiceRow(
  invoice: Pick<InvoiceRow, "visit_summary">
): string | undefined {
  const fromSummary = invoice.visit_summary?.patient_id?.trim();
  if (fromSummary) return fromSummary;
  return undefined;
}

/** Immediate list update after POST/PATCH — global + scoped org/doctor caches. */
export function mergeInvoiceIntoScopedListCaches(
  queryClient: QueryClient,
  invoice: InvoiceRow
): void {
  const previous = queryClient
    .getQueryData<InvoiceRow[]>(queryKeys.invoices.all)
    ?.find((row) => row.id === invoice.id);

  queryClient.setQueryData<InvoiceRow[]>(queryKeys.invoices.all, (old) => {
    const list = old ?? [];
    return upsertInvoiceInList(list, invoice);
  });

  const orgId = invoice.organization_id?.trim();
  const previousOrgId = previous?.organization_id?.trim();
  for (const scopedOrgId of new Set([orgId, previousOrgId].filter(Boolean) as string[])) {
    patchScopedListCache(
      queryClient,
      queryKeys.invoices.byOrganization(scopedOrgId),
      invoice,
      () => invoice.organization_id === scopedOrgId
    );
  }

  const doctorIds = new Set([
    ...resolveDoctorIdsFromInvoice(invoice),
    ...(previous ? resolveDoctorIdsFromInvoice(previous) : []),
  ]);
  for (const doctorId of doctorIds) {
    patchScopedListCache(
      queryClient,
      queryKeys.invoices.byDoctor(doctorId),
      invoice,
      (row) => invoiceMatchesDoctorScope(row, doctorId)
    );
  }

  patchScopedTotalsFromListCaches(
    queryClient,
    collectScopedPatchTargets(invoice, previous)
  );
}

/** Remove invoice from global + warm scoped list caches after DELETE. */
export function removeInvoiceFromScopedListCaches(
  queryClient: QueryClient,
  invoice: InvoiceRow
): void {
  queryClient.setQueryData<InvoiceRow[]>(queryKeys.invoices.all, (old) => {
    if (old == null) return old;
    return removeInvoiceFromList(old, invoice.id);
  });

  const orgId = invoice.organization_id?.trim();
  if (orgId) {
    removeFromScopedListCache(
      queryClient,
      queryKeys.invoices.byOrganization(orgId),
      invoice.id
    );
  }

  for (const doctorId of resolveDoctorIdsFromInvoice(invoice)) {
    removeFromScopedListCache(
      queryClient,
      queryKeys.invoices.byDoctor(doctorId),
      invoice.id
    );
  }

  patchScopedTotalsFromListCaches(queryClient, collectScopedPatchTargets(invoice));
}

export function mapApiInvoiceToRow(raw: ApiInvoice): InvoiceRow {
  return {
    id: raw.id,
    user_id: raw.user_id,
    appointment_id: raw.appointment_id ?? undefined,
    organization_id: raw.organization_id ?? undefined,
    amount: raw.amount,
    currency: raw.currency,
    status: raw.status,
    description: raw.description ?? undefined,
    due_date: toIsoDateString(raw.due_date)?.slice(0, 10),
    paid_at: toIsoDateString(raw.paid_at),
    cancelled_at: toIsoDateString(raw.cancelled_at) ?? null,
    created_at:
      typeof raw.created_at === "string"
        ? raw.created_at
        : raw.created_at.toISOString(),
    updated_at: toIsoDateString(raw.updated_at) ?? null,
    created_by_id: raw.created_by_id ?? null,
    updated_by_id: raw.updated_by_id ?? null,
    created_by_display: raw.created_by_display ?? null,
    updated_by_display: raw.updated_by_display ?? null,
    created_by_email: raw.created_by_email ?? null,
    updated_by_email: raw.updated_by_email ?? null,
    created_by_image: raw.created_by_image ?? null,
    created_by_role: raw.created_by_role ?? null,
    updated_by_image: raw.updated_by_image ?? null,
    updated_by_role: raw.updated_by_role ?? null,
    issuer_label: raw.issuer_label ?? null,
    issuer_image: raw.issuer_image ?? null,
    issuer_email: raw.issuer_email ?? null,
    issuer_role: raw.issuer_role ?? null,
    payments: (raw.payments ?? []).map(mapPayment),
    visit_summary: raw.visit_summary,
    visit_detached_at: toIsoDateString(raw.visit_detached_at) ?? null,
    visit_detached_by_id: raw.visit_detached_by_id ?? null,
    visit_detached_by_display: raw.visit_detached_by_display ?? null,
    visit_detached_by_email: raw.visit_detached_by_email ?? null,
    visit_detached_by_image: raw.visit_detached_by_image ?? null,
    visit_detached_by_role: raw.visit_detached_by_role ?? null,
    deleted_at: toIsoDateString(raw.deleted_at) ?? null,
    deleted_by_id: raw.deleted_by_id ?? null,
    deleted_by_display: raw.deleted_by_display ?? null,
    deleted_by_email: raw.deleted_by_email ?? null,
    deleted_by_image: raw.deleted_by_image ?? null,
    deleted_by_role: raw.deleted_by_role ?? null,
  };
}
