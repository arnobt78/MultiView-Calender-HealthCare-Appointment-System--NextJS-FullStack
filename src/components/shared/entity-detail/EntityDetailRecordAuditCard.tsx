"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { EntityDetailAuditStaffLink } from "@/components/shared/entity-detail/EntityDetailAuditStaffLink";
import { ClinicalEmptyDash } from "@/components/shared/ClinicalTableEmptyDash";
import { entityDetailAuditIconCircleClass } from "@/lib/patient-detail-ui-classes";
import type { EntityRole } from "@/lib/entity-routes";

type AuditActor = {
  userId?: string | null;
  label?: string | null;
  email?: string | null;
};

type EntityDetailRecordAuditCardProps = {
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: AuditActor | null;
  updatedBy?: AuditActor | null;
  viewerRole?: EntityRole | null;
  /** Override icon circle when category portal uses amber tone. */
  iconCircleClass?: string;
  iconClassName?: string;
  icon?: LucideIcon;
};

/**
 * Record audit block — timestamps + optional staff links (patient/category detail).
 */
export function EntityDetailRecordAuditCard({
  createdAt,
  updatedAt,
  createdBy,
  updatedBy,
  viewerRole,
  iconCircleClass = entityDetailAuditIconCircleClass,
  iconClassName = "h-3 w-3 text-sky-600",
  icon: Icon = CalendarClock,
}: EntityDetailRecordAuditCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-gray-700">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <span className={iconCircleClass}>
          <Icon className={iconClassName} aria-hidden />
        </span>
        Record Audit
      </div>
      <div className="mt-1 space-y-1 text-gray-700">
        <p>
          <span className="text-gray-500">Created: </span>
          {createdAt ? (
            format(new Date(createdAt), "M/d/yyyy, h:mm:ss a")
          ) : (
            <ClinicalEmptyDash layout="inline" />
          )}
          {createdBy?.label ? (
            <>
              <span className="text-gray-500"> · By </span>
              <EntityDetailAuditStaffLink
                userId={createdBy.userId}
                label={createdBy.label}
                email={createdBy.email}
                viewerRole={viewerRole}
              />
            </>
          ) : null}
        </p>
        <p>
          <span className="text-gray-500">Last Updated: </span>
          {updatedAt ? (
            format(new Date(updatedAt), "M/d/yyyy, h:mm:ss a")
          ) : (
            <ClinicalEmptyDash layout="inline" />
          )}
          {updatedBy?.label ? (
            <>
              <span className="text-gray-500"> · By </span>
              <EntityDetailAuditStaffLink
                userId={updatedBy.userId}
                label={updatedBy.label}
                email={updatedBy.email}
                viewerRole={viewerRole}
              />
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
