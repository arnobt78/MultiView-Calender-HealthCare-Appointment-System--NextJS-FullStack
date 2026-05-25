"use client";

import type { ReactNode } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorAvatar } from "@/components/shared/doctor-display/DoctorAvatar";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import type { DoctorIdentityDoctor } from "@/components/shared/doctor-display/DoctorIdentityRow";
import {
  pageChromeDescriptionClass,
  pageChromeHeaderShellClass,
  pageChromeIconTileClass,
  pageChromeTitleClass,
  pageChromeTitleStackClass,
} from "@/lib/page-chrome-classes";
import { cn } from "@/lib/utils";

type PortalDoctorChromeHeaderProps = {
  /** Logged-in doctor profile — no self-link on portal chrome. */
  doctor: DoctorIdentityDoctor | null | undefined;
  /** Pulse name/email/date only — tile + labels stay mounted. */
  profileLoading?: boolean;
  actions?: ReactNode;
  className?: string;
};

/**
 * Doctor portal top chrome — same text stack as `PortalChromeHeader` (title + description,
 * no extra gap utilities). Specialty badge sits on the title row; square avatar fills the icon tile.
 */
export function PortalDoctorChromeHeader({
  doctor,
  profileLoading = false,
  actions,
  className,
}: PortalDoctorChromeHeaderProps) {
  const label = doctor?.display_name?.trim() || doctor?.email?.trim() || "Doctor";
  const email = doctor?.email?.trim() ?? "";
  const todayLabel = format(new Date(), "EEE, MMM d yyyy");

  return (
    <div className={cn(pageChromeHeaderShellClass, className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-stretch md:justify-between">
        <div className="flex min-w-0 flex-1 items-stretch gap-2">
          <span className={cn(pageChromeIconTileClass, "overflow-hidden p-0")}>
            {profileLoading ? (
              <Skeleton className="h-full w-full rounded-xl" aria-hidden />
            ) : (
              <DoctorAvatar
                doctor={doctor ?? { id: "", email: null, display_name: null, image: null }}
                shape="square"
                sizeClassName="h-full w-full min-h-[3.5rem] min-w-[3rem]"
                className="rounded-xl border-0"
              />
            )}
          </span>
          <div className={pageChromeTitleStackClass}>
            {profileLoading ? (
              <>
                <Skeleton className="h-7 w-48 max-w-full rounded-md" aria-hidden />
                <Skeleton className="mt-0.5 h-4 w-56 max-w-full rounded-md" aria-hidden />
              </>
            ) : (
              <>
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <h1 className={pageChromeTitleClass}>{label}</h1>
                  <DoctorSpecialtyBadge specialty={doctor?.specialty} showIcon className="self-center" />
                </div>
                {email ? (
                  <p className={pageChromeDescriptionClass}>{email}</p>
                ) : (
                  <p className={cn(pageChromeDescriptionClass, "invisible")} aria-hidden>
                    —
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end justify-center text-right">
          <p className="text-xs font-medium text-muted-foreground">Today</p>
          {profileLoading ? (
            <Skeleton className="mt-1 h-5 w-36 rounded-md" aria-hidden />
          ) : (
            <p className="text-sm font-semibold text-gray-700">{todayLabel}</p>
          )}
        </div>
        {actions ? <div className="flex shrink-0 items-center">{actions}</div> : null}
      </div>
    </div>
  );
}
