"use client";

/**
 * Portal appointment doctor/admin name — sky link to `/doctors/:id` when role is doctor; else plain label.
 * Avoids broken links for admin calendar owners on patient portal.
 */

import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { useAuth } from "@/hooks/useAuth";
import { portalDoctorProfileHref } from "@/lib/entity-routes";
import { cn } from "@/lib/utils";

type PortalClinicianLinkProps = {
  clinicianUserId: string;
  clinicianRole: string | null | undefined;
  label: string;
  wrapLabel?: boolean;
  className?: string;
};

export function PortalClinicianLink({
  clinicianUserId,
  clinicianRole,
  label,
  wrapLabel,
  className,
}: PortalClinicianLinkProps) {
  const { user } = useAuth();
  const href = portalDoctorProfileHref(user?.role ?? null, clinicianUserId, clinicianRole);

  if (href) {
    return (
      <RoleEntityLink
        kind="doctor"
        id={clinicianUserId}
        label={label}
        wrapLabel={wrapLabel}
        className={cn("text-xs font-medium", className)}
      />
    );
  }

  return (
    <span className={cn("text-xs font-medium text-gray-700", className)}>{label}</span>
  );
}
