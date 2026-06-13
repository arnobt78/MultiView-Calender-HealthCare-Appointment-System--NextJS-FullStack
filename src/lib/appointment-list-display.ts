/**
 * CP appointment-management list — search blob + CSV export helpers.
 */

import { format } from "date-fns";
import type { FullAppointment } from "@/hooks/useAppointments";

export function getAppointmentListSearchBlob(appt: FullAppointment): string {
  const parts = [
    appt.title,
    appt.location,
    appt.notes,
    appt.patient_data?.firstname,
    appt.patient_data?.lastname,
    appt.patient_data?.email,
    appt.category_data?.label,
  ];
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function exportAppointmentsCSV(rows: FullAppointment[]) {
  const headers = [
    "Title",
    "Status",
    "Start",
    "End",
    "Location",
    "Patient",
    "Category",
    "Treating Physician Id",
    "Created At",
  ];
  const csvRows = rows.map((a) => [
    `"${(a.title ?? "").replace(/"/g, '""')}"`,
    a.status ?? "pending",
    format(new Date(a.start), "yyyy-MM-dd HH:mm"),
    format(new Date(a.end), "yyyy-MM-dd HH:mm"),
    `"${(a.location ?? "").replace(/"/g, '""')}"`,
    a.patient_data
      ? `"${(a.patient_data.firstname ?? "")} ${(a.patient_data.lastname ?? "")}"`.trim()
      : "",
    a.category_data ? `"${a.category_data.label ?? ""}"` : "",
    a.treating_physician_id ?? "",
    format(new Date(a.created_at), "yyyy-MM-dd HH:mm"),
  ]);
  const csv = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `appointments-${format(new Date(), "yyyy-MM-dd")}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
