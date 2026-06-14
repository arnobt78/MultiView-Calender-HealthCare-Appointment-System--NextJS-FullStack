"use client";

/**
 * NotificationsManagement — CP list parity (C33/C35 / REQ-0081, REQ-0083):
 * rose EntityListShell, stats, ClinicalListFilterToolbar, DataTable, clickable Notification column.
 * Header actions: Export CSV, Refresh, Mark all read, Clear read, New Appointment.
 * SSR subtitle + cache seed unchanged; mutations use invalidateNotificationsAndCrossTab.
 */

import { useMemo, useState } from "react";
import {
  CalendarPlus,
  CheckCheck,
  Download,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationListMetrics } from "@/hooks/useNotificationListMetrics";
import { DataTable } from "@/components/shared/DataTable";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { ControlPanelHeaderSubtitle } from "@/components/control-panel/ControlPanelHeaderSubtitle";
import { ControlPanelHeaderGlassButton } from "@/components/control-panel/ControlPanelHeaderGlassButton";
import { ControlPanelEntityListShell } from "@/components/control-panel/ControlPanelEntityListShell";
import { NotificationManagementStatsRow } from "@/components/control-panel/NotificationManagementStatsRow";
import {
  NotificationListFiltersProvider,
  useNotificationListFilters,
} from "@/components/control-panel/NotificationListFiltersContext";
import { buildNotificationManagementColumns } from "@/components/control-panel/notification-management-columns";
import { NotificationMetricsProvider } from "@/context/NotificationMetricsContext";
import AppointmentDialogController from "@/components/calendar/AppointmentDialogController";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  buildDeleteReadNotificationsConfirmSubtitle,
  buildMarkAllNotificationsReadConfirmSubtitle,
  DELETE_READ_NOTIFICATIONS_TITLE,
  MARK_ALL_NOTIFICATIONS_READ_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import { queryKeys } from "@/lib/query-keys";
import { CP_NOTIFICATIONS_SUBTITLE_LEAD } from "@/lib/control-panel-page-chrome-config";
import {
  emeraldGlassPrimaryButtonClass,
  roseGlassDangerButtonClass,
  skyGlassBackButtonClass,
  skyGlassResetButtonClass,
  violetGlassImportButtonClass,
} from "@/lib/calendar-header-action-styles";
import { cpClinicalListTableFrameClassName } from "@/lib/cp-clinical-list-table-classes";
import { APP_INNER_SCROLL_STICKY_TOP_CLASS } from "@/lib/portal-z-index";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { useControlPanelSectionInitial } from "@/components/control-panel/ControlPanelSectionInitialContext";
import {
  buildNotificationsSubtitleTotalSuffix,
  formatNotificationsSubtitleUpdatedAt,
  resolveNotificationsSubtitleTotal,
  resolveNotificationsSubtitleUpdatedAt,
} from "@/lib/notifications-subtitle";
import { runCpSectionRefresh } from "@/lib/control-panel-refresh-notify";
import { exportNotificationsCSV } from "@/lib/export-notifications-csv";
import { getNotificationListSearchBlob } from "@/lib/notification-type-display";
import {
  findFilterOptionLabel,
} from "@/lib/filter-select-option-presets";
import {
  notificationLinkFilterOptions,
  notificationReadStatusFilterOptions,
  notificationRecencyFilterOptions,
  notificationTypeFilterOptions,
  type NotificationLinkFilter,
  type NotificationReadStatusFilter,
  type NotificationRecencyFilter,
  type NotificationTypeFilter,
} from "@/lib/notification-filter-presets";
import { cn } from "@/lib/utils";

const READ_STATUS_OPTIONS = notificationReadStatusFilterOptions();
const TYPE_OPTIONS = notificationTypeFilterOptions();
const LINK_OPTIONS = notificationLinkFilterOptions();
const RECENCY_OPTIONS = notificationRecencyFilterOptions();

function NotificationsManagementInner() {
  const sectionInitial = useControlPanelSectionInitial();
  const {
    notifications,
    total,
    unreadCount,
    isLoading,
    isFetching,
    isRefetching,
    hasData,
    dataUpdatedAt,
    refetch,
    isError: notificationsError,
    markAsRead,
    markAllAsReadAsync,
    deleteReadAsync,
    isMarkingRead,
    isMarkingAllRead,
    isDeletingRead,
  } = useNotifications();

  const listBodyLoading = useCpListBodyLoading(queryKeys.notifications.all, isLoading);
  const metrics = useNotificationListMetrics(notifications, unreadCount);

  const {
    readStatus,
    setReadStatus,
    typeFilter,
    setTypeFilter,
    linkFilter,
    setLinkFilter,
    recency,
    setRecency,
    applyToolbarFilters,
  } = useNotificationListFilters();

  const [listSearch, setListSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [markAllConfirmOpen, setMarkAllConfirmOpen] = useState(false);
  const [deleteReadConfirmOpen, setDeleteReadConfirmOpen] = useState(false);

  const toolbarFiltered = useMemo(
    () => applyToolbarFilters(notifications),
    [notifications, applyToolbarFilters]
  );

  const readCount = Math.max(total - unreadCount, 0);

  const resolvedTotal = resolveNotificationsSubtitleTotal(
    total,
    hasData,
    sectionInitial?.notifications
  );
  const lastUpdatedAt = resolveNotificationsSubtitleUpdatedAt(
    dataUpdatedAt,
    sectionInitial?.notificationsPrefetchUpdatedAt
  );
  const subtitleMetricLoading =
    isFetching || listBodyLoading || lastUpdatedAt === 0;
  const subtitleMetric =
    lastUpdatedAt > 0
      ? formatNotificationsSubtitleUpdatedAt(lastUpdatedAt)
      : undefined;
  const subtitleTotalSuffix = buildNotificationsSubtitleTotalSuffix(resolvedTotal);
  const fetchingDisplay = isRefetching;

  const handleRefresh = () =>
    void runCpSectionRefresh(refetch, "notifications", {
      total: resolvedTotal ?? total,
      unreadCount,
    });

  const hasToolbarFilters = useMemo(
    () =>
      listSearch.trim().length > 0 ||
      readStatus !== "all" ||
      typeFilter !== "all" ||
      linkFilter !== "all" ||
      recency !== "all",
    [listSearch, readStatus, typeFilter, linkFilter, recency]
  );

  const resetToolbar = () => {
    setListSearch("");
    setReadStatus("all");
    setTypeFilter("all");
    setLinkFilter("all");
    setRecency("all");
  };

  const columns = useMemo(
    () =>
      buildNotificationManagementColumns({
        onMarkAsRead: markAsRead,
        isMarkingRead,
      }),
    [markAsRead, isMarkingRead]
  );

  const metricsValue = useMemo(
    () => ({
      notifications,
      metrics,
      isLoading,
      isFetching,
      listBodyLoading,
    }),
    [notifications, metrics, isLoading, isFetching, listBodyLoading]
  );

  const subtitleNode = (
    <ControlPanelHeaderSubtitle
      lead={CP_NOTIFICATIONS_SUBTITLE_LEAD}
      metric={subtitleMetric}
      metricSuffix={subtitleTotalSuffix}
      metricLoading={subtitleMetricLoading}
      showMetricSlot
    />
  );

  const headerActions = (
    <div className="flex w-full flex-wrap items-center justify-end gap-2 self-center">
      <ControlPanelHeaderGlassButton
        glassClassName={cn(violetGlassImportButtonClass, "disabled:opacity-50")}
        icon={Download}
        disabled={listBodyLoading || toolbarFiltered.length === 0}
        onClick={() => exportNotificationsCSV(toolbarFiltered)}
      >
        Export CSV
      </ControlPanelHeaderGlassButton>
      <ControlPanelHeaderGlassButton
        glassClassName={skyGlassBackButtonClass}
        icon={fetchingDisplay ? undefined : RefreshCw}
        disabled={fetchingDisplay}
        aria-busy={fetchingDisplay}
        onClick={handleRefresh}
      >
        {fetchingDisplay ? (
          <>
            <RefreshCw className="shrink-0 animate-spin" aria-hidden />
            Refreshing...
          </>
        ) : (
          "Refresh"
        )}
      </ControlPanelHeaderGlassButton>
      <ControlPanelHeaderGlassButton
        glassClassName={skyGlassResetButtonClass}
        icon={CheckCheck}
        disabled={unreadCount === 0 || isMarkingRead}
        onClick={() => unreadCount > 0 && setMarkAllConfirmOpen(true)}
      >
        Mark all read
      </ControlPanelHeaderGlassButton>
      <ControlPanelHeaderGlassButton
        glassClassName={cn(roseGlassDangerButtonClass, "disabled:opacity-50")}
        icon={Trash2}
        disabled={readCount === 0 || isDeletingRead}
        onClick={() => readCount > 0 && setDeleteReadConfirmOpen(true)}
      >
        Clear read
      </ControlPanelHeaderGlassButton>
      <ControlPanelHeaderGlassButton
        glassClassName={emeraldGlassPrimaryButtonClass}
        icon={CalendarPlus}
        onClick={() => setComposeOpen(true)}
      >
        New Appointment
      </ControlPanelHeaderGlassButton>
    </div>
  );

  if (notificationsError) {
    return (
      <div className={controlPanelSectionRootClass}>
        <ControlPanelPageChrome
          tab="notifications"
          description={subtitleNode}
          actions={headerActions}
        />
        <AppSectionErrorBanner>
          Failed to load notifications. Please refresh.
        </AppSectionErrorBanner>
      </div>
    );
  }

  return (
    <NotificationMetricsProvider value={metricsValue}>
      <ControlPanelEntityListShell
        tone="rose"
        headerSlot={
          <ControlPanelPageChrome
            tab="notifications"
            description={subtitleNode}
            actions={headerActions}
          />
        }
        statsSlot={<NotificationManagementStatsRow />}
        toolbarSlot={
          <ClinicalListFilterToolbar
            stickyClassName={APP_INNER_SCROLL_STICKY_TOP_CLASS}
            search={{
              value: listSearch,
              onChange: setListSearch,
              placeholder: "Search… (title, message, type)",
              ariaLabel: "Search notifications",
            }}
            showReset={hasToolbarFilters}
            onReset={resetToolbar}
          >
            <FilterSelect
              value={readStatus}
              onValueChange={(v) => setReadStatus(v as NotificationReadStatusFilter)}
              displayLabel={findFilterOptionLabel(READ_STATUS_OPTIONS, readStatus, "All")}
              size="toolbar"
              triggerClassName="max-w-[160px]"
              ariaLabel="Filter by read status"
              options={READ_STATUS_OPTIONS}
            />
            <FilterSelect
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as NotificationTypeFilter)}
              displayLabel={findFilterOptionLabel(TYPE_OPTIONS, typeFilter, "All types")}
              size="toolbar"
              triggerClassName="min-w-[160px] max-w-[min(42vw,220px)]"
              ariaLabel="Filter by notification type"
              options={TYPE_OPTIONS}
            />
            <FilterSelect
              value={linkFilter}
              onValueChange={(v) => setLinkFilter(v as NotificationLinkFilter)}
              displayLabel={findFilterOptionLabel(LINK_OPTIONS, linkFilter, "All links")}
              size="toolbar"
              triggerClassName="max-w-[160px]"
              ariaLabel="Filter by link presence"
              options={LINK_OPTIONS}
            />
            <FilterSelect
              value={recency}
              onValueChange={(v) => setRecency(v as NotificationRecencyFilter)}
              displayLabel={findFilterOptionLabel(RECENCY_OPTIONS, recency, "All time")}
              size="toolbar"
              triggerClassName="max-w-[180px]"
              ariaLabel="Filter by recency"
              options={RECENCY_OPTIONS}
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
              return getNotificationListSearchBlob(row).includes(s);
            }}
            externalGlobalFilter={{ value: listSearch, onChange: setListSearch }}
            emptyMessage="No notifications match your filters."
            tableClassName="min-w-[900px] w-full"
            tableFrameClassName={cpClinicalListTableFrameClassName}
            pagination={false}
          />
        }
        footerSlot={
          <>
            <ConfirmActionDialog
              open={markAllConfirmOpen}
              onOpenChange={setMarkAllConfirmOpen}
              variant="info"
              title={MARK_ALL_NOTIFICATIONS_READ_TITLE}
              subtitle={buildMarkAllNotificationsReadConfirmSubtitle(unreadCount)}
              confirmLabel="Confirm"
              cancelLabel="Cancel"
              confirmPending={isMarkingAllRead}
              confirmPendingLabel="Updating…"
              onConfirm={async () => {
                await markAllAsReadAsync();
                setMarkAllConfirmOpen(false);
              }}
            />
            <ConfirmActionDialog
              open={deleteReadConfirmOpen}
              onOpenChange={setDeleteReadConfirmOpen}
              variant="destructive"
              title={DELETE_READ_NOTIFICATIONS_TITLE}
              subtitle={buildDeleteReadNotificationsConfirmSubtitle(readCount)}
              confirmLabel="Delete read"
              cancelLabel="Cancel"
              confirmPending={isDeletingRead}
              confirmPendingLabel="Deleting…"
              onConfirm={async () => {
                await deleteReadAsync();
                setDeleteReadConfirmOpen(false);
              }}
            />
            <AppointmentDialogController
              isOpen={composeOpen}
              onOpenChange={setComposeOpen}
            />
          </>
        }
      />
    </NotificationMetricsProvider>
  );
}

export default function NotificationsManagement() {
  return (
    <NotificationListFiltersProvider>
      <NotificationsManagementInner />
    </NotificationListFiltersProvider>
  );
}
