"use client";

/**
 * Portal appointment staff name — sky link to `/doctors/:id` when role is doctor; else plain label.
 * Avoids broken links for admin calendar owners on patient portal.
 */

import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { useAuth } from "@/hooks/useAuth";
import { portalDoctorProfileHref } from "@/lib/entity-routes";
import { cn } from "@/lib/utils";

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
  label,
  wrapLabel,
  className,
}: PortalStaffLinkProps) {
  const { user } = useAuth();
  const href = portalDoctorProfileHref(user?.role ?? null, staffUserId, staffRole);

  if (href) {
    return (
      <RoleEntityLink
        kind="doctor"
        id={staffUserId}
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
