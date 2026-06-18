"use client";

import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  clinicalIdentityInlineAvatarClass,
  clinicalIdentityInlineInnerClass,
  clinicalIdentityInlineRowClass,
} from "@/lib/clinical-identity-inline-ui";
import { cn } from "@/lib/utils";

export type ProfileDefinitionRowVariant = "text" | "mono" | "multiline" | "doctorStack";

type ProfileDefinitionRowProps = {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  variant?: ProfileDefinitionRowVariant;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Pulse skeleton inside `dd` — matches DoctorIdentityRow inline wrap (portal Primary Doctor). */
function DoctorStackValueSkeleton() {
  return (
    <div className={cn(clinicalIdentityInlineRowClass, "min-h-[1.75rem]")}>
      <Skeleton className={cn(clinicalIdentityInlineAvatarClass, "shrink-0 rounded-full")} />
      <div className={clinicalIdentityInlineInnerClass}>
        <Skeleton className="h-4 w-24 max-w-full rounded-sm" />
        <Skeleton className="h-3 w-32 max-w-full rounded-sm" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

function ValueSkeleton({ variant }: { variant: ProfileDefinitionRowVariant }) {
  if (variant === "doctorStack") return <DoctorStackValueSkeleton />;
  if (variant === "mono") return <Skeleton className="h-3 w-full max-w-[280px] rounded-sm" />;
  if (variant === "multiline") return <Skeleton className="h-10 w-full max-w-md rounded-sm" />;
  return <Skeleton className="h-4 w-32 max-w-full rounded-sm" />;
}

/**
 * Patient portal profile `<dl>` row — icon + label stay mounted; only `dd` value slot skeletons while loading.
 */
export function ProfileDefinitionRow({
  icon: Icon,
  iconClassName,
  label,
  variant = "text",
  loading = false,
  children,
  className,
}: ProfileDefinitionRowProps) {
  return (
    <div
      className={cn(
        "flex gap-2.5",
        variant === "doctorStack" ? "items-center" : "items-start",
        className
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
          iconClassName
        )}
      >
        <Icon className="h-3 w-3" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-gray-600">{label}</dt>
        <dd
          className={cn(
            "font-medium text-gray-700",
            variant === "mono" && "break-all font-mono text-[10px]",
            variant === "multiline" && "leading-relaxed"
          )}
        >
          {loading ? <ValueSkeleton variant={variant} /> : children}
        </dd>
      </div>
    </div>
  );
}
