"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Building2,
  EllipsisVertical,
  Eye,
  Trash2,
  Users,
} from "lucide-react";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { Button } from "@/components/ui/button";
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
import {
  findFilterOptionLabel,
  orgInvoiceBillingFilterOptions,
  orgMemberSizeFilterOptions,
  userRoleFilterOptions,
} from "@/lib/filter-select-option-presets";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrganizationFormDialog } from "@/components/control-panel/organization-dialog/OrganizationFormDialog";
import { buildInitialMembersFromFormSlots } from "@/lib/organization-member-role";
import { OrganizationAddMemberDialog } from "@/components/control-panel/organization-dialog/OrganizationAddMemberDialog";
import { OrganizationBillingPanelCompact } from "@/components/control-panel/OrganizationBillingPanel";
import { buildOrganizationManagementColumns } from "@/lib/organization-management-columns";
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

const ORG_ROLE_OPTIONS = userRoleFilterOptions();
const ORG_MEMBER_SIZE_OPTIONS = orgMemberSizeFilterOptions();
const ORG_INVOICE_OPTIONS = orgInvoiceBillingFilterOptions();

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
          <Button variant="ghost" size="icon" type="button" className="h-7 w-7">
            <EllipsisVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <PrefetchingLink
              href={detailHref}
              className="flex cursor-pointer items-center gap-2"
            >
              <Eye className="h-4 w-4" aria-hidden />
              View Details
            </PrefetchingLink>
          </DropdownMenuItem>
          {isOwner ? (
            <>
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2"
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
                className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600"
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
  const emptyCreateForm = () => ({
    name: "",
    initialAdminId: undefined as string | undefined,
    initialDoctorId: undefined as string | undefined,
    initialPatientId: undefined as string | undefined,
  });
  const [createForm, setCreateForm] = useState(emptyCreateForm);
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

  const handleCreateDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setCreateForm(emptyCreateForm());
    }
    setCreateDialogOpen(open);
  }, []);

  const handleCreateSubmit = () => {
    const name = createForm.name.trim();
    if (!name) return;
    createOrg(
      {
        name,
        initialMembers: buildInitialMembersFromFormSlots(createForm),
      },
      {
        onSuccess: () => {
          setCreateForm(emptyCreateForm());
          setCreateDialogOpen(false);
        },
      }
    );
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
              displayLabel={findFilterOptionLabel(ORG_ROLE_OPTIONS, roleFilter, "All Roles")}
              size="toolbar"
              triggerClassName="max-w-[180px]"
              ariaLabel="Filter by your role"
              options={ORG_ROLE_OPTIONS}
            />
            <FilterSelect
              value={memberSizeFilter}
              onValueChange={(v) =>
                setMemberSizeFilter(v as OrganizationMemberSizeFilter)
              }
              displayLabel={findFilterOptionLabel(
                ORG_MEMBER_SIZE_OPTIONS,
                memberSizeFilter,
                "Any Size"
              )}
              size="toolbar"
              triggerClassName="max-w-[180px]"
              ariaLabel="Filter by member count"
              options={ORG_MEMBER_SIZE_OPTIONS}
            />
            <FilterSelect
              value={invoiceFilter}
              onValueChange={(v) => setInvoiceFilter(v as OrganizationInvoiceFilter)}
              displayLabel={findFilterOptionLabel(
                ORG_INVOICE_OPTIONS,
                invoiceFilter,
                "All Billing"
              )}
              size="toolbar"
              triggerClassName="min-w-[200px] max-w-[min(42vw,280px)]"
              ariaLabel="Filter by billing"
              options={ORG_INVOICE_OPTIONS}
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
              onOpenChange={handleCreateDialogOpenChange}
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
                onAdd={(args) =>
                  addMember(args, {
                    onSuccess: () => setAddMemberOrg(null),
                  })
                }
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
