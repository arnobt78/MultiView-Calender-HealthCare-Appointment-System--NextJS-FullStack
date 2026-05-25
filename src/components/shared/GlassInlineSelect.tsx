"use client";

/**
 * Glass enum picker — panel portalled to `document.body` with fixed anchor (see `useFloatingPanelStyle`).
 * Escapes `overflow-hidden` portal cards; `z-index` stays below navbar (`Z_NAVBAR`).
 */

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useDismissOnPointerDownOutside } from "@/hooks/useDismissOnPointerDownOutside";
import { useFloatingPanelStyle } from "@/hooks/useFloatingPanelStyle";
import {
  staffAppointmentDropdownPanelClass,
  staffAppointmentGlassSelectChevronClass,
  staffAppointmentGlassSelectPlaceholderClass,
  staffAppointmentGlassSelectTriggerClass,
  staffAppointmentGlassSelectValueClass,
} from "@/lib/appointment-dialog-ui-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";

export type GlassInlineSelectOption = {
  value: string;
  label: string;
};

type GlassInlineSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly GlassInlineSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  /** Cap list height only when option count exceeds this (weekday lists omit). */
  scrollCapAfter?: number;
};

export function GlassInlineSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  disabled = false,
  className,
  triggerClassName,
  scrollCapAfter = 12,
}: GlassInlineSelectProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const selected = options.find((o) => o.value === value);
  const panelStyle = useFloatingPanelStyle(anchorRef, open && !disabled);

  useEffect(() => {
    setMounted(true);
  }, []);

  useDismissOnPointerDownOutside(
    anchorRef,
    open && !disabled,
    () => setOpen(false),
    [panelRef]
  );

  const useScrollCap = scrollCapAfter > 0 && options.length > scrollCapAfter;

  const panel =
    open && panelStyle && mounted ? (
      <div
        ref={panelRef}
        data-slot="glass-inline-select-panel"
        role="listbox"
        style={panelStyle}
        className={cn(
          staffAppointmentDropdownPanelClass,
          "shadow-lg",
          useScrollCap && "max-h-60 overflow-y-auto"
        )}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={active}
              className={cn(
                "relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-2 pr-8 pl-3 text-left text-sm outline-hidden transition-colors",
                active ? "bg-sky-50 text-sky-900" : "text-gray-700 hover:bg-sky-50/80"
              )}
              onClick={() => {
                onValueChange(opt.value);
                setOpen(false);
              }}
            >
              <span className="min-w-0 flex-1">{toTitleCaseLabel(opt.label)}</span>
              {active ? (
                <span className="absolute right-2 flex size-3.5 items-center justify-center text-sky-700">
                  <CheckIcon className="size-4" aria-hidden />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <div ref={anchorRef} className={cn("relative min-w-0", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          staffAppointmentGlassSelectTriggerClass,
          "w-full",
          open && "border-sky-400/50 ring-2 ring-sky-200/40",
          triggerClassName
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={cn(
            staffAppointmentGlassSelectValueClass,
            !selected && staffAppointmentGlassSelectPlaceholderClass
          )}
        >
          {selected ? toTitleCaseLabel(selected.label) : toTitleCaseLabel(placeholder)}
        </span>
        <ChevronDownIcon
          className={cn(staffAppointmentGlassSelectChevronClass, "transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {panel && mounted ? createPortal(panel, document.body) : null}
    </div>
  );
}
