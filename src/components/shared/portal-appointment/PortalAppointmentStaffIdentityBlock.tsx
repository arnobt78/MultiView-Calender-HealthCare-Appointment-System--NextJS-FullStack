/** @deprecated Use `PortalAppointmentClinicianIdentityBlock`. */
import type { ReactNode } from "react";
import { PortalAppointmentClinicianIdentityBlock } from "@/components/shared/portal-appointment/PortalAppointmentClinicianIdentityBlock";
import type { PortalAppointmentClinicianUser } from "@/lib/serializers";

type Props = {
  icon: ReactNode;
  label: string;
  staff: PortalAppointmentClinicianUser;
  className?: string;
};

export function PortalAppointmentStaffIdentityBlock({ staff, ...rest }: Props) {
  return <PortalAppointmentClinicianIdentityBlock clinician={staff} {...rest} />;
}
