/**
 * Insights page scope — personal vs organization-wide; admin doctor drill-down.
 */

import { isAdminRole, isDoctorRole, isStaffRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";
import {
  DEFAULT_INSIGHTS_PERIOD,
  parsePeriodFromSearchParams,
  type InsightsPeriod,
} from "@/lib/insights/insights-period";

export type InsightsScope = "personal" | "organization";

/** Client + SSR filter — serialized in URL ?scope=&doctorId=&period= */
export type InsightsFilterKey = {
  scope: InsightsScope;
  doctorId?: string;
};

/** Full cache/API key including period. */
export type InsightsQueryKey = InsightsFilterKey & {
  period: InsightsPeriod;
};

export type InsightsDataOptions = {
  organizationWide: boolean;
  filterOwnerId: string;
};

const ORG_SCOPE_SENTINEL = "__org__" as const;

export const INSIGHTS_ORG_SELECT_VALUE = ORG_SCOPE_SENTINEL;

export function defaultInsightsFilterForRole(role: string | null | undefined): InsightsFilterKey {
  if (isDoctorRole(role)) {
    return { scope: "personal" };
  }
  if (isAdminRole(role)) {
    return { scope: "organization" };
  }
  return { scope: "organization" };
}

export function defaultInsightsQueryForRole(role: string | null | undefined): InsightsQueryKey {
  return {
    ...defaultInsightsFilterForRole(role),
    period: DEFAULT_INSIGHTS_PERIOD,
  };
}

export function insightsFilterKeyStable(filter: InsightsQueryKey): InsightsQueryKey {
  const doctorId = filter.doctorId?.trim();
  return {
    scope: filter.scope,
    period: filter.period ?? DEFAULT_INSIGHTS_PERIOD,
    ...(doctorId ? { doctorId } : {}),
  };
}

export function buildInsightsQueryString(filter: InsightsQueryKey): string {
  const params = new URLSearchParams();
  params.set("scope", filter.scope);
  params.set("period", filter.period ?? DEFAULT_INSIGHTS_PERIOD);
  const doctorId = filter.doctorId?.trim();
  if (doctorId) {
    params.set("doctorId", doctorId);
  }
  return params.toString();
}

type SearchParamInput = Record<string, string | string[] | undefined> | URLSearchParams;

function readParam(input: SearchParamInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) {
    return input.get(key) ?? undefined;
  }
  const raw = input[key];
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

export function parseInsightsFilterFromSearchParams(
  input: SearchParamInput,
  role: string | null | undefined
): InsightsFilterKey {
  const fallback = defaultInsightsFilterForRole(role);
  const scopeRaw = readParam(input, "scope");
  const doctorIdRaw = readParam(input, "doctorId")?.trim();

  let scope: InsightsScope = fallback.scope;
  if (scopeRaw === "personal" || scopeRaw === "organization") {
    scope = scopeRaw;
  }

  if (doctorIdRaw && isValidUUID(doctorIdRaw)) {
    return { scope: "personal", doctorId: doctorIdRaw };
  }

  if (scope === "organization") {
    return { scope: "organization" };
  }

  return { scope: "personal" };
}

export function parseInsightsQueryFromSearchParams(
  input: SearchParamInput,
  role: string | null | undefined
): InsightsQueryKey {
  return {
    ...parseInsightsFilterFromSearchParams(input, role),
    period: parsePeriodFromSearchParams(input, role),
  };
}

export function resolveInsightsDataOptions(
  sessionUserId: string,
  filter: InsightsFilterKey,
  role: string | null | undefined
): InsightsDataOptions {
  if (!isStaffRole(role)) {
    return { organizationWide: true, filterOwnerId: sessionUserId };
  }

  if (filter.scope === "organization") {
    return { organizationWide: true, filterOwnerId: sessionUserId };
  }

  if (isAdminRole(role) && filter.doctorId && isValidUUID(filter.doctorId)) {
    return { organizationWide: false, filterOwnerId: filter.doctorId };
  }

  return { organizationWide: false, filterOwnerId: sessionUserId };
}

export function insightsDataOptionsToLegacyOwnOnly(opts: InsightsDataOptions): boolean {
  return !opts.organizationWide;
}
