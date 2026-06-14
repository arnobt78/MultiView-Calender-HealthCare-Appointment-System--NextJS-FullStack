"use client";

import type { ReactNode } from "react";
import {
  doctorSettingsGlassListRowClass,
  type DoctorSettingsGlassSurfaceTone,
} from "@/lib/doctor-settings-glass-surfaces";
import { cn } from "@/lib/utils";

type Props = {
  tone: DoctorSettingsGlassSurfaceTone;
  enabled?: boolean;
  leading?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

/**
 * Glass morphic row — must be a direct child of `<ul>` (renders `<li>`).
 * Do not wrap in another `<li>` (hydration error).
 */
export function DoctorSettingsGlassListRow({
  tone,
  enabled = true,
  leading,
  title,
  meta,
  trailing,
  className,
}: Props) {
  return (
    <li className={cn(doctorSettingsGlassListRowClass(tone, enabled), className)}>
      {leading ? <span className="flex shrink-0 items-center">{leading}</span> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-700">{title}</p>
        {meta ? <p className="text-[11px] text-muted-foreground">{meta}</p> : null}
      </div>
      {trailing ? <span className="flex shrink-0 items-center">{trailing}</span> : null}
    </li>
  );
}
