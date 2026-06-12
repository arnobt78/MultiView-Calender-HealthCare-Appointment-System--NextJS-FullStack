export const dynamic = "force-dynamic";

import { ControlPanelSectionPageClient } from "@/components/control-panel/ControlPanelSectionPageClient";
import {
  ControlPanelChromeIconServer,
  ControlPanelChromeTitleServer,
} from "@/components/control-panel/ControlPanelChromeStaticServer";
import { ControlPanelChromeActionsServer } from "@/components/control-panel/ControlPanelChromeActionsServer";
import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import {
  prefetchControlPanelSection,
  type ControlPanelSectionPrefetchPayload,
} from "@/lib/control-panel-section-prefetch";
import { getControlPanelPageChromeConfig } from "@/lib/control-panel-page-chrome-config";
import { parseInvoiceManagementScopeFromSearchParams } from "@/lib/invoice-management-scope";
import {
  prefetchInvoicesForOrganization,
  prefetchInvoiceBillingTotalsForOrganization,
  prefetchInvoicesForDoctor,
  prefetchInvoiceBillingTotalsForDoctor,
  prefetchInvoiceBillingTotalsForViewer,
  prefetchOrganizations,
} from "@/lib/server-prefetch";
import { emptyInvoiceBillingStatusPayload } from "@/lib/invoice-billing-kpi-aggregate";
import type { OrgBillingCachePayload } from "@/lib/org-billing-prefetch";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InvoiceManagementPage({ searchParams }: PageProps) {
  const sessionUser = await getSessionUser();
  const role = sessionUser ? await getUserRole(sessionUser.userId) : null;
  const resolvedParams = await searchParams;
  const invoiceManagementFilter = parseInvoiceManagementScopeFromSearchParams(
    resolvedParams,
    role
  );

  let initial: ControlPanelSectionPrefetchPayload | null = null;

  if (sessionUser != null) {
    initial = await prefetchControlPanelSection(
      "invoices",
      sessionUser.userId,
      sessionUser.email,
      role
    );

    const organizations = await prefetchOrganizations(sessionUser.userId);
    initial = { ...initial, organizations };

    if (
      invoiceManagementFilter.scope === "org" &&
      invoiceManagementFilter.orgId
    ) {
      const orgId = invoiceManagementFilter.orgId;
      const [invoices, billingKpi] = await Promise.all([
        prefetchInvoicesForOrganization(
          orgId,
          sessionUser.userId,
          role,
          sessionUser.email
        ),
        prefetchInvoiceBillingTotalsForOrganization(orgId),
      ]);
      const orgPayload: OrgBillingCachePayload = {
        invoices: invoices ?? [],
        billingKpi: billingKpi ?? emptyInvoiceBillingStatusPayload(),
      };
      initial = {
        ...initial,
        orgBillingInvoicesByOrgId: {
          ...(initial.orgBillingInvoicesByOrgId ?? {}),
          [orgId]: orgPayload,
        },
        invoiceManagementViewerRole: role,
      };
    } else if (
      invoiceManagementFilter.scope === "doctor" &&
      invoiceManagementFilter.doctorId
    ) {
      const doctorId = invoiceManagementFilter.doctorId;
      const [invoices, billingKpi] = await Promise.all([
        prefetchInvoicesForDoctor(
          doctorId,
          sessionUser.userId,
          role,
          sessionUser.email
        ),
        prefetchInvoiceBillingTotalsForDoctor(doctorId),
      ]);
      const doctorPayload: OrgBillingCachePayload = {
        invoices: invoices ?? [],
        billingKpi: billingKpi ?? emptyInvoiceBillingStatusPayload(),
      };
      initial = {
        ...initial,
        doctorBillingByDoctorId: {
          ...(initial.doctorBillingByDoctorId ?? {}),
          [doctorId]: doctorPayload,
        },
        invoiceManagementViewerRole: role,
      };
    } else {
      const viewerBillingTotals = await prefetchInvoiceBillingTotalsForViewer(
        sessionUser.userId,
        role,
        sessionUser.email
      );
      initial = {
        ...initial,
        invoiceViewerBillingTotals: viewerBillingTotals ?? undefined,
        invoiceManagementViewerRole: role,
      };
    }
  }

  const chromeConfig = getControlPanelPageChromeConfig("invoices");

  return (
    <ControlPanelSectionPageClient
      tab="invoices"
      initial={initial}
      defaultDescription={chromeConfig.description}
      serverChromeIcon={<ControlPanelChromeIconServer tab="invoices" />}
      serverChromeTitle={<ControlPanelChromeTitleServer tab="invoices" />}
      serverChromeActions={<ControlPanelChromeActionsServer tab="invoices" />}
    />
  );
}
