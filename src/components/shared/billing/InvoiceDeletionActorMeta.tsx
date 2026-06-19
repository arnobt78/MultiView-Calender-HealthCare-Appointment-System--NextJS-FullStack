"use client";

import { format } from "date-fns";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityDetailAuditActorInline } from "@/components/shared/entity-detail/EntityDetailAuditActorInline";
import type { EntityDetailAuditActor } from "@/lib/entity-detail-audit-actor";
import {
  invoiceDetachedVisitMetaTextClass,
  invoiceDueDateTextClassForDetachedVisit,
} from "@/lib/invoice-status-display";
import { clinicalCellMutedTextClass } from "@/lib/table-display-styles";
import type { EntityRole } from "@/lib/entity-routes";
import { cn } from "@/lib/utils";

export type InvoiceDeletionActorMetaKind = "visit" | "invoice";

type Props = {
  kind: InvoiceDeletionActorMetaKind;
  at: string;
  /** From `mapInvoiceVisitDetachedByActor` / `mapInvoiceSoftDeletedByActor`. */
  actor?: EntityDetailAuditActor | null;
  viewerRole?: EntityRole;
  layout?: "wrapInline" | "compact";
  className?: string;
};

/** Rose-toned deletion stamp + optional clickable actor (REQ-0114). */
export function InvoiceDeletionActorMeta({
  kind,
  at,
  actor,
  viewerRole,
  layout = "wrapInline",
  className,
}: Props) {
  const labelClass = invoiceDetachedVisitMetaTextClass();
  const valueClass = invoiceDueDateTextClassForDetachedVisit();
  const stampLabel = kind === "visit" ? "Visit deleted" : "Invoice deleted";
  const when = format(new Date(at), "dd MMM yyyy · HH:mm");
  const by = actor?.label?.trim();
  const userId = actor?.userId?.trim();
  const emailTrimmed = actor?.email?.trim() ?? "";
  const useLinkedActor = Boolean(by && userId && viewerRole != null);

  const stamp = (
    <span className={cn("inline-flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5", className)}>
      <span className={cn("shrink-0 font-medium", labelClass)}>{stampLabel}:</span>
      <span className={cn("tabular-nums", valueClass)}>{when}</span>
    </span>
  );

  if (!by) {
    return layout === "compact" ? (
      <span className={cn("text-xs tabular-nums", valueClass)}>{stampLabel} {when}</span>
    ) : (
      stamp
    );
  }

  if (layout === "compact") {
    return (
      <div className={cn("flex min-w-0 flex-col gap-1", className)}>
        <span className={cn("text-xs tabular-nums", valueClass)}>
          {stampLabel} {when}
        </span>
        {useLinkedActor ? (
          <EntityDetailAuditActorInline
            actor={actor!}
            viewerRole={viewerRole}
            compact
          />
        ) : (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <UserAvatar src={actor?.image} alt="" fallbackText={by} sizeClassName="h-5 w-5" />
            <span className="text-sm font-normal">{by}</span>
            {emailTrimmed ? (
              <span className={cn("shrink-0 text-xs", clinicalCellMutedTextClass)} title={emailTrimmed}>
                ({emailTrimmed})
              </span>
            ) : null}
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs",
        className
      )}
    >
      {stamp}
      {useLinkedActor ? (
        <EntityDetailAuditActorInline actor={actor!} viewerRole={viewerRole} />
      ) : (
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <UserAvatar src={actor?.image} alt="" fallbackText={by} sizeClassName="h-5 w-5" />
          <span className="text-sm font-normal">{by}</span>
          {emailTrimmed ? (
            <span className={cn("shrink-0 text-xs", clinicalCellMutedTextClass)} title={emailTrimmed}>
              ({emailTrimmed})
            </span>
          ) : null}
        </span>
      )}
    </span>
  );
}
