/**
 * Human-readable insights scope labels — shared by page chrome hint and chart subtitles.
 */

import type { InsightsScope } from "@/lib/insights/insights-scope";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";

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
    return "Organization-wide";
  }

  if (isAdminRole(viewerRole) && doctorId?.trim()) {
    const name = doctorDisplayName?.trim();
    return name || "Selected doctor";
  }

  if (isDoctorRole(viewerRole)) {
    return "My practice";
  }

  if (isAdminRole(viewerRole)) {
    return "My practice";
  }

  return "My practice";
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
