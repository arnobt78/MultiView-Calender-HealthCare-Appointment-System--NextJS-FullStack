"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CalendarX, FileWarning } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  getEntityUnavailableCopy,
  type EntityUnavailableKind,
} from "@/lib/entity-unavailable-copy";
import { cn } from "@/lib/utils";
import {
  skyGlassBackButtonClass,
  skyGlassResetButtonClass,
} from "@/lib/calendar-header-action-styles";

const KIND_ICON: Record<EntityUnavailableKind, LucideIcon> = {
  appointment: CalendarX,
  invoice: FileWarning,
};

type Props = {
  kind: EntityUnavailableKind;
  variant?: "control-panel" | "portal";
  /** Portal invoice/patient override for secondary action. */
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

/** Branded empty state when a detail deep-link target was deleted (replaces raw 404). */
export function EntityUnavailableScreen({
  kind,
  variant = "control-panel",
  secondaryHref,
  secondaryLabel,
  className,
}: Props) {
  const copy = getEntityUnavailableCopy(kind, variant);
  const Icon = KIND_ICON[kind];
  const secondaryLink = secondaryHref ?? copy.secondaryHref;
  const secondaryText = secondaryLabel ?? copy.secondaryLabel;

  return (
    <div className={cn("mx-auto w-full max-w-lg px-4 py-16", className)}>
      <EmptyState
        className="border-rose-200/50 bg-white/80 shadow-[0_14px_44px_rgba(244,63,94,0.12)]"
        icon={
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-200/80 bg-rose-50 text-rose-600">
            <Icon className="h-6 w-6" aria-hidden />
          </span>
        }
        title={copy.title}
        description={copy.subtitle}
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href={copy.primaryHref} className={skyGlassBackButtonClass}>
              {copy.primaryLabel}
            </Link>
            <Link href={secondaryLink} className={skyGlassResetButtonClass}>
              {secondaryText}
            </Link>
          </div>
        }
      />
    </div>
  );
}
