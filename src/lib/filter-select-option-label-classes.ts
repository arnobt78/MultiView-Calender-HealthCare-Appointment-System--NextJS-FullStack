import { cn } from "@/lib/utils";

/** Shared row layout for filter trigger + dropdown option labels. */
export const filterSelectOptionLabelRowClass =
  "inline-flex min-w-0 items-center gap-1.5 truncate";

export const filterSelectOptionLabelTextClass = "truncate font-normal";

export const filterSelectOptionLabelIconClass = "h-3.5 w-3.5 shrink-0";

export function filterSelectOptionLabelClass(...parts: Array<string | undefined>) {
  return cn(filterSelectOptionLabelRowClass, ...parts);
}
