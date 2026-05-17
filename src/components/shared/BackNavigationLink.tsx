"use client";

import Link from "next/link";
import type { LinkProps } from "next/link";
import type { ComponentProps, MouseEvent } from "react";

function hrefToString(href: LinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (href instanceof URL) return `${href.pathname}${href.search}`;
  if (typeof href === "object" && href !== null) {
    const path = "pathname" in href && href.pathname ? String(href.pathname) : "";
    const search = "search" in href && href.search ? String(href.search) : "";
    return `${path}${search}`;
  }
  return String(href);
}
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchQueriesForDetailHref } from "@/lib/prefetch-route-queries";
import { invalidateQueriesForRoute } from "@/lib/query-client";

type BackNavigationLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onClick"> & {
  href: LinkProps["href"];
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void | Promise<void>;
};

/**
 * Back/list navigation — hover prefetch + invalidate destination caches on click.
 */
export function BackNavigationLink({
  href,
  onClick,
  onMouseEnter,
  onFocus,
  ...rest
}: BackNavigationLinkProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const hrefStr = hrefToString(href);

  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={(e) => {
        prefetchQueriesForDetailHref(queryClient, hrefStr);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        prefetchQueriesForDetailHref(queryClient, hrefStr);
        onFocus?.(e);
      }}
      onClick={async (e) => {
        e.preventDefault();
        await onClick?.(e);
        await invalidateQueriesForRoute(queryClient, hrefStr);
        router.push(hrefStr);
      }}
      {...rest}
    />
  );
}
