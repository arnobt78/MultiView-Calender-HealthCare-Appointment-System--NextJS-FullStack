"use client";

import { CalendarClock } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatInvoiceIssuedAtLabel } from "@/lib/invoice-list-row-display";
import { cn } from "@/lib/utils";

type Props = {
  createdAt: string;
  issuerLabel?: string | null;
  issuerImage?: string | null;
  className?: string;
};

/** Bottom row — invoice issued + billing owner (`div` shell; avatar is not inside `p`/`span`). */
export function InvoiceIssuedByMeta({
  createdAt,
  issuerLabel,
  issuerImage,
  className,
}: Props) {
  const when = formatInvoiceIssuedAtLabel(createdAt);
  const by = issuerLabel?.trim();

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground",
        className
      )}
    >
      <CalendarClock className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span>Invoice issued {when}</span>
        {by ? (
          <>
            <span aria-hidden>·</span>
            <UserAvatar
              src={issuerImage}
              alt=""
              fallbackText={by}
              sizeClassName="h-4 w-4"
            />
            <span>{by}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
