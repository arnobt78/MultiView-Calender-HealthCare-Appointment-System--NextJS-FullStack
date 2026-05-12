"use client";

/**
 * Route-level error boundary (Next.js App Router).
 * Catches unhandled React render errors within any route segment and shows a
 * graceful fallback instead of a blank screen. `reset()` retries the segment.
 */

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console (replace with your error-reporting service if needed)
    console.error("[GlobalError boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-200">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </span>
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-1">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          An unexpected error occurred. You can try again or navigate back to a known page.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 mt-2 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
