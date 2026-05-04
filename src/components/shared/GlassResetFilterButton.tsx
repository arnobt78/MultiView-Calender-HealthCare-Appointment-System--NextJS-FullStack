"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { skyGlassResetButtonClass } from "@/lib/calendar-header-action-styles";

type Props = {
  onClick: () => void;
  className?: string;
  /** Defaults to "Reset" — pass shorter label on tight toolbars if needed. */
  label?: string;
};

/** Shared with calendar `Filters` row and control-panel patient toolbar (glass + sky glow, readable text). */
export function GlassResetFilterButton({ onClick, className, label = "Reset" }: Props) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(skyGlassResetButtonClass, "cursor-pointer", className)}
    >
      <RotateCcw className="shrink-0" aria-hidden />
      {label}
    </Button>
  );
}
