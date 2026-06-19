"use client";

import { useMemo, useState } from "react";
import { Activity, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { AdminPortalAppointmentListRow } from "@/components/admin-portal/AdminPortalAppointmentListRow";
import { useAppointmentInvoiceDisplayMap } from "@/hooks/useAppointmentInvoiceDisplayMap";
import { paginateAdminPortalAppointments } from "@/lib/admin-portal-pagination";
import type { AdminPortalAppointmentRow } from "@/types/types";

type Props = {
  appointments: AdminPortalAppointmentRow[];
  listLoading?: boolean;
};

function ListBodyPulse({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2 py-3">
          <Skeleton className="h-10 w-20 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Paginated appointment panel — client slice only (25/page). */
export function AdminPortalAppointmentsPanel({ appointments, listLoading = false }: Props) {
  const [page, setPage] = useState(1);
  const apptIds = useMemo(() => appointments.map((a) => a.id), [appointments]);
  const invoiceDisplayByAppt = useAppointmentInvoiceDisplayMap(apptIds);

  const pagination = useMemo(
    () => paginateAdminPortalAppointments(appointments, page),
    [appointments, page]
  );

  return (
    <PortalPanelSection
      title="Recent Appointments"
      subtitle="Clinic-wide visits — newest first (up to 100)"
      icon={Activity}
      iconClassName="border-sky-100 bg-sky-50 [&_svg]:text-sky-600"
      count={appointments.length}
      countSkeleton={listLoading}
    >
      {listLoading ? (
        <ListBodyPulse />
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <CalendarCheck className="mb-2 h-8 w-8 text-emerald-400" aria-hidden />
          <p className="text-sm">No appointments yet</p>
        </div>
      ) : (
        <>
          <div>
            {pagination.items.map((appt) => (
              <AdminPortalAppointmentListRow
                key={appt.id}
                appt={appt}
                invoiceDisplayStatus={invoiceDisplayByAppt.get(appt.id)}
              />
            ))}
          </div>
          {pagination.totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/40 pt-3">
              <p className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} visits
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </PortalPanelSection>
  );
}
