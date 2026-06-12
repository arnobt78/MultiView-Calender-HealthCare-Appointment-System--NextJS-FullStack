/**
 * CP invoice-management scope — all workspace, org, or doctor drill-down.
 * URL: ?scope=all | ?scope=org&orgId=… | ?scope=doctor&doctorId=…
 */

import { isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";

export type InvoiceManagementScope = "all" | "org" | "doctor";

export type InvoiceManagementFilterKey = {
  scope: InvoiceManagementScope;
  orgId?: string;
  doctorId?: string;
};

/** GET /api/invoices and billing-totals scope params (org XOR doctor). */
export type InvoicesListScopeParams = {
  organizationId?: string;
  doctorId?: string;
};

export const INVOICE_MANAGEMENT_ALL_SCOPE = "all" as const;

export {
  filterInvoicesByDoctorScope,
  invoiceMatchesDoctorScope,
} from "@/lib/invoice-doctor-scope";

export function defaultInvoiceManagementFilterForRole(
  role: string | null | undefined
): InvoiceManagementFilterKey {
  if (isAdminRole(role)) {
    return { scope: "all" };
  }
  return { scope: "all" };
}

export function invoiceManagementFilterKeyStable(
  filter: InvoiceManagementFilterKey
): InvoiceManagementFilterKey {
  const orgId = filter.orgId?.trim();
  const doctorId = filter.doctorId?.trim();
  if (filter.scope === "org" && orgId && isValidUUID(orgId)) {
    return { scope: "org", orgId };
  }
  if (filter.scope === "doctor" && doctorId && isValidUUID(doctorId)) {
    return { scope: "doctor", doctorId };
  }
  return { scope: "all" };
}

export function buildInvoiceManagementQueryString(
  filter: InvoiceManagementFilterKey
): string {
  const stable = invoiceManagementFilterKeyStable(filter);
  const params = new URLSearchParams();
  params.set("scope", stable.scope);
  if (stable.scope === "org" && stable.orgId) {
    params.set("orgId", stable.orgId);
  }
  if (stable.scope === "doctor" && stable.doctorId) {
    params.set("doctorId", stable.doctorId);
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

export function parseInvoiceManagementScopeFromSearchParams(
  input: SearchParamInput,
  role: string | null | undefined
): InvoiceManagementFilterKey {
  const fallback = defaultInvoiceManagementFilterForRole(role);
  const scopeRaw = readParam(input, "scope");
  const orgIdRaw = readParam(input, "orgId")?.trim();
  const doctorIdRaw = readParam(input, "doctorId")?.trim();

  if (doctorIdRaw && isValidUUID(doctorIdRaw)) {
    return { scope: "doctor", doctorId: doctorIdRaw };
  }

  if (
    (scopeRaw === "org" || (orgIdRaw && isValidUUID(orgIdRaw))) &&
    orgIdRaw &&
    isValidUUID(orgIdRaw)
  ) {
    return { scope: "org", orgId: orgIdRaw };
  }

  if (scopeRaw === "doctor" && doctorIdRaw && isValidUUID(doctorIdRaw)) {
    return { scope: "doctor", doctorId: doctorIdRaw };
  }

  if (scopeRaw === "all" || !scopeRaw) {
    return { scope: "all" };
  }

  return fallback;
}
