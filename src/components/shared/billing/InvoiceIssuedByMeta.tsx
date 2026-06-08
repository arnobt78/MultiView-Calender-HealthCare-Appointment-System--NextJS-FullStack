"use client";

import { CalendarClock } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityDetailAuditActorInline } from "@/components/shared/entity-detail/EntityDetailAuditActorInline";
import { formatInvoiceIssuedAtLabel } from "@/lib/invoice-list-row-display";
import { clinicalCellMutedTextClass } from "@/lib/table-display-styles";
import type { EntityRole } from "@/lib/entity-routes";
import { cn } from "@/lib/utils";

type Props = {
  createdAt: string;
  issuerLabel?: string | null;
  issuerImage?: string | null;
  /** Billing owner email — Record Audit / list rows after name. */
  issuerEmail?: string | null;
  /** When set with issuerLabel — links issuer to doctor/admin profile (portal meta row). */
  issuerUserId?: string | null;
  issuerRole?: string | null;
  viewerRole?: EntityRole;
  className?: string;
  /** Record audit row uses outer sky icon — omit inner clock. */
  showLeadingIcon?: boolean;
};

/** Bottom row — invoice issued + billing owner (`div` shell; avatar is not inside `p`/`span`). */
export function InvoiceIssuedByMeta({
  createdAt,
  issuerLabel,
  issuerImage,
  issuerEmail,
  issuerUserId,
  issuerRole,
  viewerRole,
  className,
  showLeadingIcon = true,
}: Props) {
  const when = formatInvoiceIssuedAtLabel(createdAt);
  const by = issuerLabel?.trim();
  const emailTrimmed = issuerEmail?.trim() ?? "";
  const userId = issuerUserId?.trim();
  const useLinkedActor = Boolean(by && userId && viewerRole != null);

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground",
        className
      )}
    >
      {showLeadingIcon ? (
        <CalendarClock className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
      ) : null}
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span>Invoice issued {when}</span>
        {by ? (
          <>
            <span aria-hidden>·</span>
            {useLinkedActor ? (
              <EntityDetailAuditActorInline
                actor={{
                  userId: userId!,
                  label: by,
                  email: issuerEmail,
                  image: issuerImage,
                  role: issuerRole,
                }}
                viewerRole={viewerRole}
              />
            ) : (
              <>
                <UserAvatar
                  src={issuerImage}
                  alt=""
                  fallbackText={by}
                  sizeClassName="h-4 w-4"
                />
                <span>{by}</span>
                {emailTrimmed ? (
                  <span
                    className={cn("shrink-0", clinicalCellMutedTextClass)}
                    title={emailTrimmed}
                  >
                    ({emailTrimmed})
                  </span>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
