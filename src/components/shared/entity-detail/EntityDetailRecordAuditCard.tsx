"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { EntityDetailAuditActorInline } from "@/components/shared/entity-detail/EntityDetailAuditActorInline";
import { ClinicalEmptyDash } from "@/components/shared/ClinicalTableEmptyDash";
import { entityDetailAuditIconCircleClass } from "@/lib/patient-detail-ui-classes";
import type { EntityRole } from "@/lib/entity-routes";
import type { EntityDetailAuditExtraRow } from "@/lib/appointment-detail-invoice-audit-rows";
import type { EntityDetailAuditActor } from "@/lib/entity-detail-audit-actor";

type EntityDetailRecordAuditCardProps = {
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: EntityDetailAuditActor | null;
  updatedBy?: EntityDetailAuditActor | null;
  viewerRole?: EntityRole | null;
  /** Invoice issued / due / paid rows (appointment detail). */
  extraRows?: EntityDetailAuditExtraRow[];
  /** Override icon circle when category portal uses amber tone. */
  iconCircleClass?: string;
  iconClassName?: string;
  icon?: LucideIcon;
};

/**
 * Record audit block — timestamps + optional staff links + optional extra rows.
 */
export function EntityDetailRecordAuditCard({
  createdAt,
  updatedAt,
  createdBy,
  updatedBy,
  viewerRole,
  extraRows,
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
      <div className="mt-1 space-y-1.5 text-gray-700">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
          <span className={iconCircleClass} aria-hidden>
            <CalendarClock className={iconClassName} />
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>
              <span className="text-gray-500">Created: </span>
              {createdAt ? (
                format(new Date(createdAt), "M/d/yyyy, h:mm:ss a")
              ) : (
                <ClinicalEmptyDash layout="inline" />
              )}
            </span>
            {createdBy ? (
              <>
                <span className="text-gray-500" aria-hidden>
                  ·
                </span>
                <EntityDetailAuditActorInline actor={createdBy} viewerRole={viewerRole} />
              </>
            ) : null}
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
          <span className={iconCircleClass} aria-hidden>
            <CalendarClock className={iconClassName} />
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>
              <span className="text-gray-500">Last updated: </span>
              {updatedAt ? (
                format(new Date(updatedAt), "M/d/yyyy, h:mm:ss a")
              ) : (
                <ClinicalEmptyDash layout="inline" />
              )}
            </span>
            {updatedBy ? (
              <>
                <span className="text-gray-500" aria-hidden>
                  ·
                </span>
                <EntityDetailAuditActorInline actor={updatedBy} viewerRole={viewerRole} />
              </>
            ) : null}
          </div>
        </div>
        {extraRows?.map((row, index) => (
          <div
            key={`${row.label ?? "row"}-${index}`}
            className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-sm"
          >
            <span className={iconCircleClass} aria-hidden>
              <row.icon className={iconClassName} />
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1">
              {row.label ? (
                <span className="text-gray-500">{row.label}: </span>
              ) : null}
              {row.children}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
