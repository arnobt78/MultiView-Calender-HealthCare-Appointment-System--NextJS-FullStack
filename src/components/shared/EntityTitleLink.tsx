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
        "inline-flex items-center text-sky-700 transition-colors hover:text-sky-800 hover:bg-sky-50/60 rounded-md px-1 py-0.5 no-underline",
        className
      )}
    >
      {label}
    </PrefetchingLink>
  );
}

