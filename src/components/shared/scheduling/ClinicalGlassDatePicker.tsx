"use client";

import { useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  clinicalGlassDatePickerPlaceholderClass,
  clinicalGlassDatePickerTriggerClass,
  type ClinicalGlassDatePickerTone,
} from "@/lib/clinical-glass-date-picker-classes";
import { cn } from "@/lib/utils";

export type ClinicalGlassDatePickerProps = {
  /** ISO date `YYYY-MM-DD` — matches invoice `due_date` and patient `birth_date` API fields. */
  value: string;
  onChange: (isoDate: string) => void;
  id?: string;
  disabled?: boolean;
  tone?: ClinicalGlassDatePickerTone;
  /** Popover alignment — invoice due date opens to the right (`end`). */
  align?: "start" | "center" | "end";
  placeholder?: string;
  className?: string;
};

function parseIsoDateOnly(value: string): Date | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const d = parseISO(trimmed.length === 10 ? `${trimmed}T12:00:00` : trimmed);
  return isValid(d) ? d : undefined;
}

function toIsoDateOnly(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Glass-styled calendar popover — client-only (dialogs). Keeps `YYYY-MM-DD` string state for forms.
 */
export function ClinicalGlassDatePicker({
  value,
  onChange,
  id,
  disabled = false,
  tone = "amber",
  align = "end",
  placeholder = "Select date",
  className,
}: ClinicalGlassDatePickerProps) {
  const selected = useMemo(() => parseIsoDateOnly(value), [value]);
  const label = selected ? format(selected, "PPP") : placeholder;

  return (
    <Popover>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={disabled}
        className={cn(clinicalGlassDatePickerTriggerClass(tone), className)}
        aria-label={selected ? `Due date ${label}` : placeholder}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span
            className={cn(
              "min-w-0 truncate text-left",
              !selected && clinicalGlassDatePickerPlaceholderClass
            )}
          >
            {label}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => {
            if (day) onChange(toIsoDateOnly(day));
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
