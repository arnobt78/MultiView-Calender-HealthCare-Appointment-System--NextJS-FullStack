"use client";

/** @deprecated Use `PortalClinicianLink` — portal doctor/admin identity, not `/staff` URLs. */
import { PortalClinicianLink } from "@/components/shared/PortalClinicianLink";

type PortalStaffLinkProps = {
  staffUserId: string;
  staffRole: string | null | undefined;
  label: string;
  wrapLabel?: boolean;
  className?: string;
};

export function PortalStaffLink({
  staffUserId,
  staffRole,
  ...rest
}: PortalStaffLinkProps) {
  return (
    <PortalClinicianLink
      clinicianUserId={staffUserId}
      clinicianRole={staffRole}
      {...rest}
    />
  );
}
