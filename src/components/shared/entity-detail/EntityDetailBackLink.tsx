"use client";

import { ArrowLeft, List } from "lucide-react";
import type { LinkProps } from "next/link";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { cn } from "@/lib/utils";

type EntityDetailBackLinkProps = {
  href: LinkProps["href"];
  /** Header: ArrowLeft + "Back". Footer: List + configurable label. */
  placement: "header" | "footer";
  backButtonClassName: string;
  footerLabel?: string;
  className?: string;
};

/** Tone-matched glass back link — prefetch + invalidate list route on click. */
export function EntityDetailBackLink({
  href,
  placement,
  backButtonClassName,
  footerLabel = "Back To List",
  className,
}: EntityDetailBackLinkProps) {
  const Icon = placement === "header" ? ArrowLeft : List;
  const label = placement === "header" ? "Back" : footerLabel;

  return (
    <BackNavigationLink
      href={href}
      className={cn(backButtonClassName, "no-underline", className)}
    >
      <Icon className="shrink-0" aria-hidden />
      {label}
    </BackNavigationLink>
  );
}
