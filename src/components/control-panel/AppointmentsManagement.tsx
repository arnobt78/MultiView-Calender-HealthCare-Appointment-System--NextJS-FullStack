"use client";

/**
 * AppointmentsManagement — CP list parity with patient-management:
 * sky shell, stats row, ClinicalListFilterToolbar, DataTable, header Export + New Appointment.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleCalendarSyncOptional } from "@/context/GoogleCalendarSyncContext";
import { useAppointments } from "@/hooks/useAppointments";
import { useCategories } from "@/hooks/useCategories";
import { useUsers } from "@/hooks/useUsers";
import { useAppointmentListMetrics } from "@/hooks/useAppointmentListMetrics";
import { useAppointmentInvoiceDisplayMap } from "@/hooks/useAppointmentInvoiceDisplayMap";
import { usePayments } from "@/hooks/usePayments";
import { DataTable } from "@/components/shared/DataTable";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { DoctorFilterSelect } from "@/components/shared/filters/DoctorFilterSelect";
import { CategoryFilterSelect } from "@/components/shared/filters/CategoryFilterSelect";
import { GlassResetFilterButton } from "@/components/shared/GlassResetFilterButton";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { ControlPanelHeaderGlassButton } from "@/components/control-panel/ControlPanelHeaderGlassButton";
import { ControlPanelEntityListShell } from "@/components/control-panel/ControlPanelEntityListShell";
import { AppointmentManagementStatsRow } from "@/components/control-panel/AppointmentManagementStatsRow";
import {
  AppointmentListFiltersProvider,
  useAppointmentListFilters,
  type AppointmentStatusFilter,
} from "@/components/control-panel/AppointmentListFiltersContext";
import type { PatientCareTierFilter } from "@/components/control-panel/PatientListFiltersContext";
import { buildAppointmentManagementColumns } from "@/components/control-panel/appointment-management-columns";
import { AppointmentMetricsProvider } from "@/context/AppointmentMetricsContext";
import AppointmentDialogController from "@/components/calendar/AppointmentDialogController";
import { CP_DOCTOR_USERS_FILTERS } from "@/lib/control-panel-users-filters";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import { queryKeys } from "@/lib/query-keys";
import {
  exportAppointmentsCSV,
  getAppointmentListSearchBlob,
} from "@/lib/appointment-list-display";
import {
  appointmentCalendarStatusFilterOptions,
  careTierFilterOptions,
  findFilterOptionLabel,
} from "@/lib/filter-select-option-presets";
import {
  emeraldGlassPrimaryButtonClass,
  violetGlassImportButtonClass,
} from "@/lib/calendar-header-action-styles";
import { cpClinicalListTableFrameClassName } from "@/lib/cp-clinical-list-table-classes";
import { APP_INNER_SCROLL_STICKY_TOP_CLASS } from "@/lib/portal-z-index";
import { resolveAppSectionRootClass } from "@/lib/section-page-layout";
import { cn } from "@/lib/utils";
import { getInvoiceForAppointment } from "@/lib/appointment-invoice-lookup";
import type { InvoiceRow } from "@/lib/billing-types";

const APPOINTMENT_STATUS_OPTIONS = appointmentCalendarStatusFilterOptions("all");
const APPOINTMENT_CARE_TIER_OPTIONS = careTierFilterOptions();

function AppointmentsManagementInner() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    appointments,
    isLoading,
    isFetching,
    isError,
    error,
    deleteAppointment,
    toggleStatus,
    cancelAppointment,
  } = useAppointments();
  const { isConnected: isGoogleConnected, syncToGoogle, syncingAppointmentId } =
    useGoogleCalendarSyncOptional();
  const { categories } = useCategories();
  const { data: doctorsData } = useUsers(CP_DOCTOR_USERS_FILTERS);
  const doctorById = useMemo(
    () => new Map((doctorsData?.users ?? []).map((d) => [d.id, d])),
    [doctorsData?.users]
  );

  const listBodyLoading = useCpListBodyLoading(queryKeys.appointments.all, isLoading);
  const metrics = useAppointmentListMetrics(appointments);

  const {
    status,
    setStatus,
    doctorId,
    setDoctorId,
    categoryId,
    setCategoryId,
    careTier,
    setCareTier,
    applyToolbarFilters,
  } = useAppointmentListFilters();

  const toolbarFiltered = useMemo(
    () => applyToolbarFilters(appointments),
    [appointments, applyToolbarFilters]
  );

  const appointmentIds = useMemo(
    () => toolbarFiltered.map((a) => a.id),
    [toolbarFiltered]
  );
  const invoiceDisplayByAppt = useAppointmentInvoiceDisplayMap(appointmentIds);
  const { invoices } = usePayments();
  const invoiceByAppt = useMemo(() => {
    const map = new Map<string, InvoiceRow>();
    for (const id of appointmentIds) {
      const inv = getInvoiceForAppointment(invoices, id);
      if (inv) map.set(id, inv);
    }
    return map;
  }, [appointmentIds, invoices]);

  const [listSearch, setListSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const hasToolbarFilters = useMemo(
    () =>
      listSearch.trim().length > 0 ||
      status !== "all" ||
      doctorId !== "all" ||
      categoryId !== "all" ||
      careTier !== "all",
    [listSearch, status, doctorId, categoryId, careTier]
  );

  const resetToolbar = () => {
    setListSearch("");
    setStatus("all");
    setDoctorId("all");
    setCategoryId("all");
    setCareTier("all");
  };

  const columns = useMemo(
    () =>
      buildAppointmentManagementColumns({
        viewerRole: "admin",
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        doctorById,
        invoiceDisplayByAppt,
        invoiceByAppt,
        onEdit: (id) => router.push(`/control-panel/appointments/${id}`),
        onToggleStatus: (id, next) => toggleStatus({ id, status: next }),
        onDelete: deleteAppointment,
        onCancel: cancelAppointment,
        showSyncToGoogle: isGoogleConnected,
        onSyncToGoogle: syncToGoogle,
        syncingAppointmentId,
      }),
    [doctorById, invoiceDisplayByAppt, invoiceByAppt, router, toggleStatus, deleteAppointment, cancelAppointment, user, isGoogleConnected, syncToGoogle, syncingAppointmentId]
  );

  const metricsValue = useMemo(
    () => ({
      appointments,
      metrics,
      isLoading,
      isFetching,
      listBodyLoading,
    }),
    [appointments, metrics, isLoading, isFetching, listBodyLoading]
  );

  if (isError) {
    return (
      <div className={resolveAppSectionRootClass()}>
        <ControlPanelPageChrome tab="appointments_mgmt" />
        <AppSectionErrorBanner>
          {error?.message ?? "Failed to load appointments"}
        </AppSectionErrorBanner>
      </div>
    );
  }

  return (
    <AppointmentMetricsProvider value={metricsValue}>
      <ControlPanelEntityListShell
        tone="sky"
        headerSlot={
          <ControlPanelPageChrome
            tab="appointments_mgmt"
            actions={
              <>
                <ControlPanelHeaderGlassButton
                  glassClassName={cn(violetGlassImportButtonClass, "disabled:opacity-50")}
                  icon={Download}
                  disabled={listBodyLoading || toolbarFiltered.length === 0}
                  onClick={() => exportAppointmentsCSV(toolbarFiltered)}
                >
                  Export CSV
                </ControlPanelHeaderGlassButton>
                <ControlPanelHeaderGlassButton
                  glassClassName={emeraldGlassPrimaryButtonClass}
                  icon={CalendarPlus}
                  onClick={() => setComposeOpen(true)}
                >
                  New Appointment
                </ControlPanelHeaderGlassButton>
              </>
            }
          />
        }
        statsSlot={<AppointmentManagementStatsRow />}
        toolbarSlot={
          <ClinicalListFilterToolbar
            stickyClassName={APP_INNER_SCROLL_STICKY_TOP_CLASS}
            search={{
              value: listSearch,
              onChange: setListSearch,
              placeholder: "Search… (title, patient, location)",
              ariaLabel: "Search appointments",
            }}
            showReset={hasToolbarFilters}
            onReset={resetToolbar}
          >
            <FilterSelect
              value={status}
              onValueChange={(v) => setStatus(v as AppointmentStatusFilter)}
              displayLabel={findFilterOptionLabel(
                APPOINTMENT_STATUS_OPTIONS,
                status,
                "All Statuses"
              )}
              size="toolbar"
              triggerClassName="max-w-[180px]"
              ariaLabel="Filter by appointment status"
              options={APPOINTMENT_STATUS_OPTIONS}
            />
            <DoctorFilterSelect
              value={doctorId === "all" ? "all" : doctorId}
              onValueChange={(v) => setDoctorId(v === "all" ? "all" : v)}
              doctors={doctorsData?.users ?? []}
              allLabel="All doctors"
              ariaLabel="Filter by treating doctor"
            />
            <CategoryFilterSelect
              value={categoryId === "all" ? null : categoryId}
              onValueChange={(id) => setCategoryId(id ?? "all")}
              categories={categories}
              allLabel="All categories"
            />
            <FilterSelect
              value={careTier}
              onValueChange={(v) => setCareTier(v as PatientCareTierFilter)}
              displayLabel={findFilterOptionLabel(
                APPOINTMENT_CARE_TIER_OPTIONS,
                careTier,
                "All Care Tiers"
              )}
              size="toolbar"
              triggerClassName="max-w-[180px]"
              ariaLabel="Filter by patient care tier"
              options={APPOINTMENT_CARE_TIER_OPTIONS}
            />
          </ClinicalListFilterToolbar>
        }
        tableSlot={
          <DataTable
            columns={columns}
            data={toolbarFiltered}
            isLoading={listBodyLoading}
            globalFilterFn={(row, q) => {
              const s = q.trim().toLowerCase();
              if (!s) return true;
              return getAppointmentListSearchBlob(row).includes(s);
            }}
            externalGlobalFilter={{ value: listSearch, onChange: setListSearch }}
            emptyMessage="No appointments match your filters."
            tableClassName="min-w-[1100px] w-full"
            tableFrameClassName={cpClinicalListTableFrameClassName}
            pagination={false}
          />
        }
        footerSlot={
          <AppointmentDialogController
            isOpen={composeOpen}
            onOpenChange={setComposeOpen}
          />
        }
      />
    </AppointmentMetricsProvider>
  );
}

export default function AppointmentsManagement() {
  return (
    <AppointmentListFiltersProvider>
      <AppointmentsManagementInner />
    </AppointmentListFiltersProvider>
  );
}
