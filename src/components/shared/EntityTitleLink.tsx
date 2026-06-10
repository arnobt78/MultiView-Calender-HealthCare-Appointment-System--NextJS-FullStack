"use client";

import { cn } from "@/lib/utils";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";

type EntityTitleLinkProps = {
  href: string;
  label: string;
  className?: string;
  /** Tables: ellipsis. Hover/month detail: full multi-line label. */
  wrapLabel?: boolean;
};

export function EntityTitleLink({
  href,
  label,
  className,
  wrapLabel,
}: EntityTitleLinkProps) {
  return (
    // Shared table title link style: sky text with subtle hover emphasis.
    <PrefetchingLink
      href={href}
      className={cn(
        // No horizontal/vertical padding so stacked email lines in tables align with the name link.
        wrapLabel
          ? "inline max-w-full min-w-0 cursor-pointer rounded-md text-sky-700 no-underline transition-colors hover:bg-sky-50/60 hover:text-sky-800"
          : "inline-flex max-w-full min-w-0 cursor-pointer items-center rounded-md text-sky-700 no-underline transition-colors hover:bg-sky-50/60 hover:text-sky-800",
        className
      )}
    >
      <span
        className={cn(
          wrapLabel
            ? "break-words [overflow-wrap:anywhere] whitespace-normal"
            : "truncate"
        )}
      >
        {label}
      </span>
    </PrefetchingLink>
  );
}

