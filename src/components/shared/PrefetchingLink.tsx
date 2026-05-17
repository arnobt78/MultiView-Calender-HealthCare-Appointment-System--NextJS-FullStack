"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchQueriesForDetailHref } from "@/lib/prefetch-route-queries";

type PrefetchingLinkProps = ComponentProps<typeof Link>;

/**
 * Next.js Link + route-aware TanStack prefetch on hover/focus (control-panel detail routes).
 */
export function PrefetchingLink({ href, onMouseEnter, onFocus, ...rest }: PrefetchingLinkProps) {
  const queryClient = useQueryClient();
  const hrefStr =
    typeof href === "string" ? href : `${href.pathname ?? ""}${href.search ?? ""}`;

  return (
    <Link
      prefetch
      href={href}
      onMouseEnter={(e) => {
        prefetchQueriesForDetailHref(queryClient, hrefStr);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        prefetchQueriesForDetailHref(queryClient, hrefStr);
        onFocus?.(e);
      }}
      {...rest}
    />
  );
}
