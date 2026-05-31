"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CpDevStubSubmitNote } from "@/components/shared/control-panel/CpDevStubSubmitNote";
import type { CpDevStubCopy } from "@/lib/cp-dev-stub-copy";
import { cn } from "@/lib/utils";

type CpListPaginationDevStubProps = {
  stub: CpDevStubCopy;
  /** Rows currently rendered in the table (after client filters). */
  visibleCount: number;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    count: number;
  } | null;
  className?: string;
};

/**
 * Load-more stub for CP lists backed by paginated GET /api/users.
 * Button + note stay visible so implementers know offset/limit is already supported server-side.
 */
export function CpListPaginationDevStub({
  stub,
  visibleCount,
  pagination,
  className,
}: CpListPaginationDevStubProps) {
  const total = pagination?.total ?? visibleCount;
  const loaded = pagination?.count ?? visibleCount;
  const hasMore = total > loaded;

  return (
    <div className={cn("mt-2 space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Showing {visibleCount} row{visibleCount === 1 ? "" : "s"}
          {pagination ? ` · API reports ${loaded} loaded / ${total} total` : null}
          {hasMore ? " · more available via offset" : null}
        </p>
        <Button type="button" size="sm" variant="outline" disabled className="gap-1.5 opacity-70">
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          Load more
        </Button>
      </div>
      <CpDevStubSubmitNote stub={stub} />
    </div>
  );
}
