"use client";

import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { controlPanelStaffDetailHref, doctorDetailHref, type EntityRole } from "@/lib/entity-routes";
import { isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";

type EntityDetailAuditStaffLinkProps = {
  userId?: string | null;
  label?: string | null;
  email?: string | null;
  viewerRole?: EntityRole | null;
  /** When known, admin accounts link to CP `/users/:id` instead of `/doctors/:id`. */
  staffRole?: string | null;
};

/** Role-aware staff link in entity detail audit rows (CP doctors tab vs portal `/doctors/:id`). */
export function EntityDetailAuditStaffLink({
  userId,
  label,
  email,
  viewerRole,
  staffRole,
}: EntityDetailAuditStaffLinkProps) {
  const name = label?.trim();
  if (!name) return null;
  const em = email?.trim();
  const canLink = userId && isValidUUID(userId);
  const href = canLink
    ? isAdminRole(viewerRole ?? null)
      ? controlPanelStaffDetailHref(userId, staffRole)
      : doctorDetailHref(viewerRole ?? "doctor", userId)
    : null;

  return (
    <span className="inline text-gray-700">
      {href ? (
        <EntityTitleLink href={href} label={name} className="font-normal" />
      ) : (
        name
      )}
      {em ? <span className="text-gray-600"> ({em})</span> : null}
    </span>
  );
}
