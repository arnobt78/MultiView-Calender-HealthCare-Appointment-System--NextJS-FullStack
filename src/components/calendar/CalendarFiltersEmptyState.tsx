"use client";

import type { ComponentType } from "react";
import {
  CalendarRange,
  CalendarDays,
  Circle,
  Search,
  SlidersHorizontal,
  Stethoscope,
  Tag,
  UserRound,
} from "lucide-react";
import { GlassResetFilterButton } from "@/components/shared/GlassResetFilterButton";
import type {
  CalendarFilterEmptyChip,
  CalendarFiltersEmptyCopy,
} from "@/lib/calendar-filters-empty-copy";
import { cn } from "@/lib/utils";

const CHIP_ICON: Record<
  CalendarFilterEmptyChip["icon"],
  ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  search: Search,
  visits: Stethoscope,
  category: Tag,
  patient: UserRound,
  date: CalendarDays,
  status: Circle,
  month: CalendarRange,
};

type CalendarFiltersEmptyStateProps = {
  copy: CalendarFiltersEmptyCopy;
  onReset: () => void;
  className?: string;
};

/** List view — filtered-empty panel (dynamic chips + clear filters). */
export function CalendarFiltersEmptyState({
  copy,
  onReset,
  className,
}: CalendarFiltersEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] items-center justify-center px-4",
        className
      )}
    >
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/90 px-6 py-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-2xl border border-amber-200/70 bg-amber-50/90 text-amber-700">
          <SlidersHorizontal className="size-6" aria-hidden />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-slate-800">
          {copy.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{copy.description}</p>
        {copy.chips.length > 0 ? (
          <ul
            className="mt-4 flex flex-wrap items-center justify-center gap-2"
            aria-label="Active filters"
          >
            {copy.chips.map((chip) => {
              const Icon = CHIP_ICON[chip.icon];
              return (
                <li
                  key={`${chip.icon}-${chip.label}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/90 px-3 py-1 text-xs font-normal text-slate-700"
                >
                  <Icon className="size-3.5 shrink-0 text-slate-500" aria-hidden />
                  <span className="max-w-[220px] truncate">{chip.label}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
        <div className="mt-6 flex justify-center">
          <GlassResetFilterButton onClick={onReset} label="Clear all filters" />
        </div>
      </div>
    </div>
  );
}
