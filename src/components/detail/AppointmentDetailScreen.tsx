/**
 * Appointment detail entry — delegates to shared glass layout.
 * Used by `/control-panel/appointments/[id]` and `/appointments/[id]`.
 */

import { AppointmentDetailScreenShared } from "@/components/shared/appointment-detail/AppointmentDetailScreenShared";
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";
import type { UsersListResponse } from "@/hooks/useUsers";
import type { Invoice } from "@/hooks/usePayments";
import type { GoogleCalendarStatus } from "@/types/google-calendar";

export type AppointmentDetailScreenProps = {
  backHref: string;
  variant: "control-panel" | "portal";
  initialDetail: AppointmentDetailViewModel;
  initialDoctorUsers?: UsersListResponse | null;
  initialAdminUsers?: UsersListResponse | null;
  initialInvoices?: Invoice[] | null;
  /** Staff Google Calendar connection — seeds sync footer on first paint. */
  initialGoogleCalendarStatus?: GoogleCalendarStatus | null;
};

export function AppointmentDetailScreen({
  backHref,
  variant,
  initialDetail,
  initialDoctorUsers,
  initialAdminUsers,
  initialInvoices,
  initialGoogleCalendarStatus,
}: AppointmentDetailScreenProps) {
  const tone = variant === "control-panel" ? "violet" : "sky";
  const backListLabel =
    variant === "control-panel" ? "Back To Appointments" : "Back To Portal";

  return (
    <AppointmentDetailScreenShared
      tone={tone}
      mode={variant}
      backHref={backHref}
      backListLabel={backListLabel}
      initialDetail={initialDetail}
      initialDoctorUsers={initialDoctorUsers}
      initialAdminUsers={initialAdminUsers}
      initialInvoices={initialInvoices}
      initialGoogleCalendarStatus={initialGoogleCalendarStatus}
    />
  );
}
