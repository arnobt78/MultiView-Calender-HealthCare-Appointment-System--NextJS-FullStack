"use client";

/**
 * Inline insights fetch failure — page chrome stays mounted; user can change scope/period and retry.
 */

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INSIGHTS_PAGE_LOAD_ERROR } from "@/lib/insights-page-copy";

type Props = {
  onRetry: () => void;
  isRetrying?: boolean;
};

export function InsightsDataErrorBanner({ onRetry, isRetrying = false }: Props) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>{INSIGHTS_PAGE_LOAD_ERROR}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 border-red-200 bg-white text-red-700 hover:bg-red-50"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? "Retrying…" : "Retry"}
      </Button>
    </div>
  );
}
