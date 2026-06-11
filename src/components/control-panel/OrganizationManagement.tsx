"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Building2,
  EllipsisVertical,
  Eye,
  ListFilter,
  Receipt,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { ControlPanelHeaderGlassButton } from "@/components/control-panel/ControlPanelHeaderGlassButton";
import { ControlPanelEntityListShell } from "@/components/control-panel/ControlPanelEntityListShell";
import { OrganizationManagementStatsRow } from "@/components/control-panel/OrganizationManagementStatsRow";
import {
  OrganizationListFiltersProvider,
  useOrganizationListFilters,
  type OrganizationInvoiceFilter,
  type OrganizationMemberSizeFilter,
  type OrganizationRoleFilter,
} from "@/components/control-panel/OrganizationListFiltersContext";
import { OrganizationMetricsProvider } from "@/context/OrganizationMetricsContext";
import { useOrganizationListMetrics } from "@/hooks/useOrganizationListMetrics";
import { useOrganization, type Organization } from "@/hooks/useOrganization";
import { DataTable } from "@/components/shared/DataTable";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrganizationFormDialog } from "@/components/control-panel/organization-dialog/OrganizationFormDialog";
import { OrganizationAddMemberDialog } from "@/components/control-panel/organization-dialog/OrganizationAddMemberDialog";
import { OrganizationBillingPanelCompact } from "@/components/control-panel/OrganizationBillingPanel";
import {
  buildOrganizationManagementColumns,
  OrganizationActionsTrigger,
} from "@/lib/organization-management-columns";
import {
  buildOrganizationDeleteConfirmSubtitle,
  DELETE_ORGANIZATION_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import { indigoGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { cpClinicalListTableFrameClassName } from "@/lib/cp-clinical-list-table-classes";
import { organizationDetailHref } from "@/lib/entity-routes";
import { APP_INNER_SCROLL_STICKY_TOP_CLASS } from "@/lib/portal-z-index";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import { queryKeys } from "@/lib/query-keys";
import { resolveAppSectionRootClass } from "@/lib/section-page-layout";
import { ORG_BILLING_PREFETCH_ORG_CAP } from "@/lib/org-billing-prefetch";

const ROLE_FILTER_LABEL: Record<OrganizationRoleFilter, string> = {
  all: "All Roles",
  admin: "Admin",
  doctor: "Doctor",
  patient: "Patient",
};

const MEMBER_SIZE_LABEL: Record<OrganizationMemberSizeFilter, string> = {
  all: "Any Size",
  solo: "Solo (1)",
  small: "Small (2–5)",
  large: "Large (6+)",
};

const INVOICE_FILTER_LABEL: Record<OrganizationInvoiceFilter, string> = {
  all: "All Billing",
  has_invoices: "Has Invoices",
  outstanding: "Outstanding Balance",
  none: "No Invoices",
};

function OrganizationRowActions({
  org,
  isOwner,
  onAddMember,
  onDelete,
}: {
  org: Organization;
  isOwner: boolean;
  onAddMember: (org: Organization) => void;
  onDelete: (orgId: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const detailHref = organizationDetailHref("admin", org.id);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <OrganizationActionsTrigger />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={detailHref} className="flex items-center gap-2">
              <Eye className="h-4 w-4" aria-hidden />
              View Details
            </Link>
          </DropdownMenuItem>
          {isOwner ? (
            <>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onAddMember(org);
                }}
              >
                <Users className="h-4 w-4" aria-hidden />
                Add Member
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onSelect={(e) => {
                  e.preventDefault();
                  setConfirmOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete Organization
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {isOwner ? (
        <>
          <ConfirmActionDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            variant="destructive"
            title={DELETE_ORGANIZATION_CONFIRM_TITLE}
            subtitle={buildOrganizationDeleteConfirmSubtitle(org.name)}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={() => {
              onDelete(org.id);
              setConfirmOpen(false);
            }}
          />
        </>
      ) : null}
    </>
  );
}

function OrganizationManagementInner() {
  const {
    organizations,
    isLoading,
    isError,
    createOrg,
    isCreating,
    addMember,
    isAddingMember,
    deleteOrg,
  } = useOrganization();

  const {
    roleFilter,
    setRoleFilter,
    memberSizeFilter,
    setMemberSizeFilter,
    invoiceFilter,
    setInvoiceFilter,
    filterOrganizations,
  } = useOrganizationListFilters();

  const [listSearch, setListSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "" });
  const [addMemberOrg, setAddMemberOrg] = useState<Organization | null>(null);

  const listBodyLoading = useCpListBodyLoading(queryKeys.organizations.all, isLoading);
  const metrics = useOrganizationListMetrics(organizations);

  const filteredByToolbar = useMemo(
    () => filterOrganizations(organizations),
    [organizations, filterOrganizations]
  );

  const hasToolbarFilters =
    roleFilter !== "all" ||
    memberSizeFilter !== "all" ||
    invoiceFilter !== "all" ||
    listSearch.trim().length > 0;

  const resetToolbar = useCallback(() => {
    setListSearch("");
    setRoleFilter("all");
    setMemberSizeFilter("all");
    setInvoiceFilter("all");
  }, [setRoleFilter, setMemberSizeFilter, setInvoiceFilter]);

  const columns = useMemo(
    () =>
      buildOrganizationManagementColumns({
        renderActions: ({ org, isOwner }) => (
          <OrganizationRowActions
            org={org}
            isOwner={isOwner}
            onAddMember={setAddMemberOrg}
            onDelete={deleteOrg}
          />
        ),
      }),
    [deleteOrg]
  );

  const handleCreateSubmit = () => {
    const name = createForm.name.trim();
    if (!name) return;
    createOrg(name, {
      onSuccess: () => {
        setCreateForm({ name: "" });
        setCreateDialogOpen(false);
      },
    });
  };

  if (isError) {
    return (
      <div className={resolveAppSectionRootClass("control-panel")}>
        <ControlPanelPageChrome tab="organizations" />
        <AppSectionErrorBanner>
          Failed to load organizations. Please refresh.
        </AppSectionErrorBanner>
      </div>
    );
  }

  return (
    <OrganizationMetricsProvider
      value={{
        organizations,
        metrics,
        isLoading,
        listBodyLoading,
      }}
    >
      <ControlPanelEntityListShell
        tone="indigo"
        headerSlot={
          <ControlPanelPageChrome
            tab="organizations"
            actions={
              <ControlPanelHeaderGlassButton
                glassClassName={indigoGlassPrimaryButtonClass}
                icon={Building2}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Organization
              </ControlPanelHeaderGlassButton>
            }
          />
        }
        statsSlot={<OrganizationManagementStatsRow />}
        toolbarSlot={
          <ClinicalListFilterToolbar
            stickyClassName={APP_INNER_SCROLL_STICKY_TOP_CLASS}
            search={{
              value: listSearch,
              onChange: setListSearch,
              placeholder: "Search… (name or slug)",
              ariaLabel: "Search organizations by name or slug",
            }}
            showReset={hasToolbarFilters}
            onReset={resetToolbar}
          >
            <FilterSelect
              value={roleFilter}
              onValueChange={(v) => setRoleFilter(v as OrganizationRoleFilter)}
              displayLabel={ROLE_FILTER_LABEL[roleFilter]}
              icon={ListFilter}
              size="toolbar"
              triggerClassName="max-w-[180px]"
              ariaLabel="Filter by your role"
              options={[
                { value: "all", label: "All Roles" },
                { value: "admin", label: "Admin" },
                { value: "doctor", label: "Doctor" },
                { value: "patient", label: "Patient" },
              ]}
            />
            <FilterSelect
              value={memberSizeFilter}
              onValueChange={(v) =>
                setMemberSizeFilter(v as OrganizationMemberSizeFilter)
              }
              displayLabel={MEMBER_SIZE_LABEL[memberSizeFilter]}
              icon={Users}
              size="toolbar"
              triggerClassName="max-w-[180px]"
              ariaLabel="Filter by member count"
              options={[
                { value: "all", label: "Any Size" },
                { value: "solo", label: "Solo (1)" },
                { value: "small", label: "Small (2–5)" },
                { value: "large", label: "Large (6+)" },
              ]}
            />
            <FilterSelect
              value={invoiceFilter}
              onValueChange={(v) => setInvoiceFilter(v as OrganizationInvoiceFilter)}
              displayLabel={INVOICE_FILTER_LABEL[invoiceFilter]}
              icon={Receipt}
              size="toolbar"
              triggerClassName="max-w-[200px]"
              ariaLabel="Filter by billing"
              options={[
                { value: "all", label: "All Billing" },
                { value: "has_invoices", label: "Has Invoices" },
                { value: "outstanding", label: "Outstanding Balance" },
                { value: "none", label: "No Invoices" },
              ]}
            />
          </ClinicalListFilterToolbar>
        }
        tableSlot={
          <DataTable<Organization, unknown>
            columns={columns}
            data={filteredByToolbar}
            isLoading={listBodyLoading}
            globalFilterFn={(row, q) => {
              const s = q.trim().toLowerCase();
              if (!s) return true;
              const o = row;
              const blob = `${o.name} ${o.slug} ${o.role}`;
              return blob.toLowerCase().includes(s);
            }}
            externalGlobalFilter={{ value: listSearch, onChange: setListSearch }}
            searchPlaceholder="Search by name or slug…"
            emptyMessage="No organizations yet. Create one to manage teams and billing."
            tableClassName="min-w-[1080px] w-full"
            tableFrameClassName={cpClinicalListTableFrameClassName}
          />
        }
        footerSlot={
          <>
            <OrganizationFormDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              mode="create"
              form={createForm}
              onFormChange={(patch) => setCreateForm((p) => ({ ...p, ...patch }))}
              onSubmit={handleCreateSubmit}
              isSubmitting={isCreating}
            />
            {addMemberOrg ? (
              <OrganizationAddMemberDialog
                org={addMemberOrg}
                open={!!addMemberOrg}
                onOpenChange={(open) => {
                  if (!open) setAddMemberOrg(null);
                }}
                onAdd={addMember}
                isSubmitting={isAddingMember}
              />
            ) : null}
            {!listBodyLoading &&
              filteredByToolbar.slice(0, ORG_BILLING_PREFETCH_ORG_CAP).map((org) => (
                <OrganizationBillingPanelCompact
                  key={org.id}
                  organizationId={org.id}
                  organizationName={org.name}
                />
              ))}
          </>
        }
      />
    </OrganizationMetricsProvider>
  );
}

/** Organization list — indigo CP shell parity with patient-management (REQ-0064). */
export default function OrganizationManagement() {
  return (
    <OrganizationListFiltersProvider>
      <OrganizationManagementInner />
    </OrganizationListFiltersProvider>
  );
}
