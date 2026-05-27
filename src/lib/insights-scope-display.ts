/**
 * Human-readable insights scope labels — page chrome, chart subtitles, and v2.meta.scopeLabel (SSR/API).
 */

import type { InsightsDataOptions, InsightsScope } from "@/lib/insights/insights-scope";
import { prisma } from "@/lib/prisma";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";

export const INSIGHTS_SCOPE_LABEL_ORG = "Organization-wide";
export const INSIGHTS_SCOPE_LABEL_OWN = "My practice";
export const INSIGHTS_SCOPE_LABEL_SELECTED_DOCTOR = "Selected doctor";

/** Sentinel when sync resolver needs a DB lookup (admin doctor drill-down). */
export const INSIGHTS_SCOPE_LABEL_NEEDS_OWNER_LOOKUP = "__insights_scope_owner_lookup__";

export type ResolveInsightsScopeLabelInput = {
  scope: InsightsScope;
  viewerRole: string | null | undefined;
  /** Set when admin drills into a doctor's personal metrics. */
  doctorId?: string;
  doctorDisplayName?: string;
};

/** Short scope fragment for chart subtitles (e.g. "My practice", "Organization-wide"). */
export function resolveInsightsScopeChartLabel(input: ResolveInsightsScopeLabelInput): string {
  const { scope, viewerRole, doctorId, doctorDisplayName } = input;

  if (scope === "organization") {
    return INSIGHTS_SCOPE_LABEL_ORG;
  }

  if (isAdminRole(viewerRole) && doctorId?.trim()) {
    const name = doctorDisplayName?.trim();
    return name || INSIGHTS_SCOPE_LABEL_SELECTED_DOCTOR;
  }

  if (isDoctorRole(viewerRole)) {
    return INSIGHTS_SCOPE_LABEL_OWN;
  }

  if (isAdminRole(viewerRole)) {
    return INSIGHTS_SCOPE_LABEL_OWN;
  }

  return INSIGHTS_SCOPE_LABEL_OWN;
}

/**
 * Pure scope label from data-layer options — no I/O.
 * Returns INSIGHTS_SCOPE_LABEL_NEEDS_OWNER_LOOKUP when admin views another user's practice.
 */
export function resolveInsightsScopeLabelSync(
  opts: InsightsDataOptions,
  sessionUserId: string
): string {
  if (opts.organizationWide) {
    return INSIGHTS_SCOPE_LABEL_ORG;
  }
  if (opts.filterOwnerId === sessionUserId) {
    return INSIGHTS_SCOPE_LABEL_OWN;
  }
  return INSIGHTS_SCOPE_LABEL_NEEDS_OWNER_LOOKUP;
}

/** Resolve treating/owner doctor name for scoped insights (admin drill-down). */
export async function fetchInsightsScopeOwnerDisplayName(ownerUserId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: ownerUserId },
    select: { display_name: true, email: true },
  });
  const name = user?.display_name?.trim() || user?.email?.trim();
  return name || INSIGHTS_SCOPE_LABEL_SELECTED_DOCTOR;
}

/** SSR/API/Redis scope fragment — matches client chart subtitles on first paint. */
export async function resolveInsightsScopeLabelForMeta(
  sessionUserId: string,
  opts: InsightsDataOptions
): Promise<string> {
  const sync = resolveInsightsScopeLabelSync(opts, sessionUserId);
  if (sync !== INSIGHTS_SCOPE_LABEL_NEEDS_OWNER_LOOKUP) {
    return sync;
  }
  return fetchInsightsScopeOwnerDisplayName(opts.filterOwnerId);
}

/** Longer hint for PortalChromeHeader description on /insights. */
export function resolveInsightsScopePageHint(input: ResolveInsightsScopeLabelInput): string | undefined {
  const label = resolveInsightsScopeChartLabel(input);
  const { scope, viewerRole, doctorId } = input;

  if (scope === "organization") {
    return "Showing organization-wide metrics.";
  }

  if (isAdminRole(viewerRole) && doctorId?.trim()) {
    return `Showing metrics for ${label}.`;
  }

  if (isDoctorRole(viewerRole)) {
    return "Showing metrics for your practice.";
  }

  return undefined;
}
