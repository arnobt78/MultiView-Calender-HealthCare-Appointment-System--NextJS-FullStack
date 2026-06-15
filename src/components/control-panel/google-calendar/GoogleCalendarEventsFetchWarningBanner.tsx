"use client";

import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import {
  googleCalendarEventsFetchWarningBannerClass,
  googleCalendarWarningCopy,
} from "@/lib/google-calendar-ui-classes";
import type { GoogleCalendarEventsFetchWarning } from "@/types/google-calendar";

type Props = {
  warning: GoogleCalendarEventsFetchWarning;
  isRefreshing?: boolean;
  onRefresh?: () => void;
};

/** Connected state + Google list API failure — does not flip connection badge. */
export function GoogleCalendarEventsFetchWarningBanner({
  warning,
  isRefreshing = false,
  onRefresh,
}: Props) {
  const activationUrl = warning.activationUrl?.trim();

  return (
    <div className={googleCalendarEventsFetchWarningBannerClass} role="alert">
      <div className="flex min-w-0 items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
        <div className="min-w-0 space-y-2">
          <p className="leading-snug">{warning.message}</p>
          {warning.code === "SERVICE_DISABLED" && activationUrl ? (
            <Link
              href={activationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 underline-offset-2 hover:underline"
            >
              {googleCalendarWarningCopy.enableApiLinkLabel}
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
      {onRefresh ? (
        <ControlPanelGlassActionButton
          variant="sky"
          className="shrink-0 self-start sm:self-center"
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          {isRefreshing ? "Refreshing…" : "Refresh events"}
        </ControlPanelGlassActionButton>
      ) : null}
    </div>
  );
}
