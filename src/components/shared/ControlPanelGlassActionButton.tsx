"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  emeraldGlassPrimaryButtonClass,
  roseGlassDangerButtonClass,
  skyGlassBackButtonClass,
  violetGlassPrimaryButtonClass,
} from "@/lib/calendar-header-action-styles";

export type ControlPanelGlassActionVariant = "sky" | "emerald" | "violet" | "rose";

const VARIANT: Record<ControlPanelGlassActionVariant, string> = {
  sky: skyGlassBackButtonClass,
  emerald: emeraldGlassPrimaryButtonClass,
  violet: violetGlassPrimaryButtonClass,
  rose: roseGlassDangerButtonClass,
};

type ButtonProps = React.ComponentPropsWithoutRef<"button">;

/** Glass action chip (h-10) — use with footer bars; links use `PrefetchingLink` + `skyGlassBackButtonClass`. */
export const ControlPanelGlassActionButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { variant: ControlPanelGlassActionVariant }
>(function ControlPanelGlassActionButton({ variant, className, type = "button", ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      // VARIANT tokens already include cursor-pointer (calendar-header-action-styles).
      className={cn(VARIANT[variant], "disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
});
