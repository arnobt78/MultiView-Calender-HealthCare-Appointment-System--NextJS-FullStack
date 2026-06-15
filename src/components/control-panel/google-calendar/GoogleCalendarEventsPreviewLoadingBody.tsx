"use client";

import { Loader2 } from "lucide-react";
import { cpClinicalListTableFrameClassName } from "@/lib/cp-clinical-list-table-classes";
import { googleCalendarPreviewCopy } from "@/lib/google-calendar-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Indigo table-frame loading body — first sync after connect (SSR seed has empty events). */
export function GoogleCalendarEventsPreviewLoadingBody({ className }: Props) {
  return (
    <div
      className={cn(cpClinicalListTableFrameClassName, className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 px-4 py-10 text-center">
        <Loader2 className="h-6 w-6 shrink-0 animate-spin text-indigo-600" aria-hidden />
        <p className="text-sm font-medium text-gray-700">
          {googleCalendarPreviewCopy.loadingEvents}
        </p>
        <p className="text-xs text-muted-foreground">
          {googleCalendarPreviewCopy.loadingEventsHint}
        </p>
      </div>
    </div>
  );
}
