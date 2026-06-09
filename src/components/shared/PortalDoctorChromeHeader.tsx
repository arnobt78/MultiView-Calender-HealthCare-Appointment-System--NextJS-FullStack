"use client";

import type { ReactNode } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AppPageChrome } from "@/components/shared/AppPageChrome";
import { DoctorAvatar } from "@/components/shared/doctor-display/DoctorAvatar";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import type { DoctorIdentityDoctor } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { pageChromeIconTileClass } from "@/lib/page-chrome-classes";
import { cn } from "@/lib/utils";

type PortalDoctorChromeHeaderProps = {
  doctor: DoctorIdentityDoctor | null | undefined;
  profileLoading?: boolean;
  actions?: ReactNode;
  className?: string;
};

/** Doctor portal chrome — `AppPageChrome` with avatar leading + Today aside. */
export function PortalDoctorChromeHeader({
  doctor,
  profileLoading = false,
  actions,
  className,
}: PortalDoctorChromeHeaderProps) {
  const label = doctor?.display_name?.trim() || doctor?.email?.trim() || "Doctor";
  const email = doctor?.email?.trim() ?? "";
  const todayLabel = format(new Date(), "EEE, MMM d yyyy");

  const leading = (
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
  );

  const title = profileLoading ? (
    <Skeleton className="h-7 w-48 max-w-full rounded-md" aria-hidden />
  ) : (
    label
  );

  const titleAddon =
    profileLoading || !doctor?.specialty ? null : (
      <DoctorSpecialtyBadge specialty={doctor.specialty} showIcon className="self-center" />
    );

  const description = profileLoading ? (
    <Skeleton className="h-4 w-56 max-w-full rounded-md" aria-hidden />
  ) : email ? (
    email
  ) : (
    <span className="invisible" aria-hidden>
      —
    </span>
  );

  const aside = (
    <div className="flex shrink-0 flex-col items-end justify-center self-center text-right">
      <p className="text-xs font-medium text-muted-foreground">Today</p>
      {profileLoading ? (
        <Skeleton className="mt-1 h-5 w-36 rounded-md" aria-hidden />
      ) : (
        <p className="text-sm font-semibold text-gray-700">{todayLabel}</p>
      )}
    </div>
  );

  return (
    <AppPageChrome
      variant="portal"
      tone="sky"
      leading={leading}
      title={title}
      titleAddon={titleAddon}
      description={description}
      aside={aside}
      actions={actions}
      borderBottom
      className={className}
    />
  );
}
