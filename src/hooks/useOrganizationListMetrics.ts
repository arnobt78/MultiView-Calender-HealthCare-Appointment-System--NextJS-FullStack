import { useMemo } from "react";
import type { Organization } from "@/hooks/useOrganization";

/** Derived counts for organization stat cards — pure function of enriched list rows. */
export type OrganizationListMetrics = {
  totalOrgs: number;
  totalMembers: number;
  totalAdmins: number;
  totalDoctors: number;
  totalPatients: number;
  totalInvoices: number;
  totalOutstandingCents: number;
};

export function deriveOrganizationListMetrics(
  organizations: Organization[]
): OrganizationListMetrics {
  let totalMembers = 0;
  let totalAdmins = 0;
  let totalDoctors = 0;
  let totalPatients = 0;
  let totalInvoices = 0;
  let totalOutstandingCents = 0;
  for (const org of organizations) {
    totalMembers += org.member_count;
    totalAdmins += org.members_by_role.admin;
    totalDoctors += org.members_by_role.doctor;
    totalPatients += org.members_by_role.patient;
    totalInvoices += org.invoice_count;
    totalOutstandingCents += org.outstanding_cents;
  }
  return {
    totalOrgs: organizations.length,
    totalMembers,
    totalAdmins,
    totalDoctors,
    totalPatients,
    totalInvoices,
    totalOutstandingCents,
  };
}

export function useOrganizationListMetrics(organizations: Organization[]): OrganizationListMetrics {
  return useMemo(() => deriveOrganizationListMetrics(organizations), [organizations]);
}
