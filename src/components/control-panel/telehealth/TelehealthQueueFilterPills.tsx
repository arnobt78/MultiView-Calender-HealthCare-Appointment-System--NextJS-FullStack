"use client";

import { cn } from "@/lib/utils";
import {
  telehealthQueueFilterPillGroupClass,
  telehealthQueueFilterTabActiveClass,
  telehealthQueueFilterTabInactiveClass,
} from "@/lib/telehealth-queue-ui-classes";
import type { TelehealthQueueDateFilter } from "@/lib/telehealth-queue-filter";

type Props = {
  value: TelehealthQueueDateFilter;
  onChange: (value: TelehealthQueueDateFilter) => void;
};

const OPTIONS: { id: TelehealthQueueDateFilter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
];

/** Date tab pills — dashboard header glow parity (active = violet/50 bg + white text). */
export function TelehealthQueueFilterPills({ value, onChange }: Props) {
  return (
    <div
      className={telehealthQueueFilterPillGroupClass}
      role="tablist"
      aria-label="Telehealth queue date filter"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={value === opt.id}
          className={cn(
            value === opt.id
              ? telehealthQueueFilterTabActiveClass
              : telehealthQueueFilterTabInactiveClass
          )}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
