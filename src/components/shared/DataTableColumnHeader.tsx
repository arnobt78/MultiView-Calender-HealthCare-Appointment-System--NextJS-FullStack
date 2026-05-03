"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Sortable column title — toggles asc/desc; keeps table headers consistent across control-panel lists.
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
    return <span className={cn("font-medium text-muted-foreground", className)}>{title}</span>;
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 gap-1 px-2 font-medium text-muted-foreground hover:text-foreground", className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      aria-label={`Sort by ${title}`}
    >
      {title}
      {column.getIsSorted() === "desc" ? (
        <ArrowDown className="h-4 w-4 shrink-0" />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUp className="h-4 w-4 shrink-0" />
      ) : (
        <ArrowUpDown className="h-4 w-4 shrink-0 opacity-60" />
      )}
    </Button>
  );
}
