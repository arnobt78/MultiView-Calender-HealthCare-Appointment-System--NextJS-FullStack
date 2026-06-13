"use client";

import { CalendarClock } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityDetailAuditActorInline } from "@/components/shared/entity-detail/EntityDetailAuditActorInline";
import { formatInvoiceIssuedAtLabel } from "@/lib/invoice-list-row-display";
import {
  clinicalIdentityCompactStackNameEmailRowClass,
  clinicalIdentityCompactStackRowClass,
  clinicalIdentityCompactStackStaffAvatarClass,
  clinicalIdentityCompactStackTextColClass,
} from "@/lib/clinical-identity-inline-ui";
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
  /** CP invoice table — sky tone on "Invoice issued …" text. */
  issuedTextTone?: "muted" | "sky";
  /** CP invoice table — no icon, single-line issued stamp, inline issuer row. */
  compact?: boolean;
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
  issuedTextTone = "muted",
  compact = false,
}: Props) {
  const when = formatInvoiceIssuedAtLabel(createdAt);
  const by = issuerLabel?.trim();
  const emailTrimmed = issuerEmail?.trim() ?? "";
  const userId = issuerUserId?.trim();
  const useLinkedActor = Boolean(by && userId && viewerRole != null);
  const showIcon = showLeadingIcon && !compact;

  const issuedTextClass =
    issuedTextTone === "sky" ? "text-sky-700" : "text-muted-foreground";

  return (
    <div
      className={cn(
        "inline-flex min-w-0 max-w-full flex-col gap-0.5 text-[11px] leading-snug",
        issuedTextTone === "muted" && "text-muted-foreground",
        className
      )}
    >
      <span className={cn(compact ? "whitespace-nowrap" : undefined, issuedTextClass)}>
        {showIcon ? (
          <CalendarClock
            className="mr-1 inline h-3 w-3 shrink-0 align-[-2px] text-gray-400"
            aria-hidden
          />
        ) : null}
        Invoice issued {when}
      </span>
      {by ? (
        useLinkedActor ? (
          <EntityDetailAuditActorInline
            actor={{
              userId: userId!,
              label: by,
              email: issuerEmail,
              image: issuerImage,
              role: issuerRole,
            }}
            viewerRole={viewerRole}
            compact={compact}
          />
        ) : compact ? (
          <div className={clinicalIdentityCompactStackRowClass}>
            <UserAvatar
              src={issuerImage}
              alt=""
              fallbackText={by}
              sizeClassName={clinicalIdentityCompactStackStaffAvatarClass}
            />
            <div className={clinicalIdentityCompactStackTextColClass}>
              <div className={clinicalIdentityCompactStackNameEmailRowClass}>
                <span className="min-w-0 shrink truncate text-sm font-normal">{by}</span>
                {emailTrimmed ? (
                  <span
                    className={cn("shrink-0 text-xs", clinicalCellMutedTextClass)}
                    title={emailTrimmed}
                  >
                    ({emailTrimmed})
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <span className="inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <UserAvatar
              src={issuerImage}
              alt=""
              fallbackText={by}
              sizeClassName="h-5 w-5"
            />
            <span className="text-sm font-normal">{by}</span>
            {emailTrimmed ? (
              <span className={cn("shrink-0 text-sm", clinicalCellMutedTextClass)} title={emailTrimmed}>
                ({emailTrimmed})
              </span>
            ) : null}
          </span>
        )
      ) : null}
    </div>
  );
}
