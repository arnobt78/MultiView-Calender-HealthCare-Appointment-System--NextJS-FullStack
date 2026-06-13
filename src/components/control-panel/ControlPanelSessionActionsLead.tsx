"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { useNavSession } from "@/hooks/useNavSession";
import { getDoctorAvatarSrc } from "@/lib/doctor-avatar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  className?: string;
};

/** Compact viewer identity for CP header actions row — avatar, name, role badge. */
export function ControlPanelSessionActionsLead({ className }: Props) {
  const { effectiveUser: user, avatarLoading } = useNavSession();

  if (avatarLoading && !user?.id) {
    return (
      <div className={cn("flex min-w-0 items-center gap-2 pr-2", className)}>
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="hidden min-w-0 flex-col gap-1 sm:flex">
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    );
  }

  if (!user?.id) return null;

  const label = user.display_name?.trim() || user.email?.trim() || "User";
  const avatarSrc =
    user.id && user.email
      ? getDoctorAvatarSrc({ id: user.id, email: user.email, image: user.image })
      : undefined;

  return (
    <div
      className={cn(
        "flex min-w-0 max-w-[min(100%,14rem)] items-center gap-2 self-center pr-1 sm:max-w-[16rem]",
        className
      )}
    >
      <UserAvatar
        src={avatarSrc}
        fallbackText={label}
        className="h-9 w-9 shrink-0"
      />
      <div className="hidden min-w-0 flex-col gap-0.5 sm:flex">
        <span className="truncate text-sm font-medium text-gray-800" title={label}>
          {label}
        </span>
        {user.role ? <UserRoleBadge role={user.role} className="w-fit shrink-0" /> : null}
      </div>
    </div>
  );
}
