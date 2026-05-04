"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sortable column title — toggles asc/desc; keeps table headers consistent across control-panel lists.
 * Uses a plain `<button>` with `p-0` so only `<th>`/`TableHead` outer padding applies (no nested `px-3` from `Button` size sm).
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return (
      <span className={cn("block w-full text-left font-medium text-muted-foreground", className)}>
        {title}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 w-full min-w-0 cursor-pointer items-center justify-start gap-1 rounded-md border-0 bg-transparent p-0 text-left text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent/60 hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      aria-label={`Sort by ${title}`}
    >
      {title}
      {column.getIsSorted() === "desc" ? (
        <ArrowDown className="h-4 w-4 shrink-0" aria-hidden />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUp className="h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <ArrowUpDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
      )}
    </button>
  );
}
