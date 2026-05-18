"use client";

import { cn } from "@/lib/utils";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";

type EntityTitleLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function EntityTitleLink({ href, label, className }: EntityTitleLinkProps) {
  return (
    // Shared table title link style: sky text with subtle hover emphasis.
    <PrefetchingLink
      href={href}
      className={cn(
        // No horizontal/vertical padding so stacked email lines in tables align with the name link.
        "inline-flex max-w-full min-w-0 items-center rounded-md text-sky-700 no-underline transition-colors hover:bg-sky-50/60 hover:text-sky-800",
        className
      )}
    >
      <span className="truncate">{label}</span>
    </PrefetchingLink>
  );
}

