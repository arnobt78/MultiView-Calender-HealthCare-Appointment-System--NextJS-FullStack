"use client";

import { cn } from "@/lib/utils";

type TruncatedTextProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

/** Ellipsis truncation for long notes, locations, labels in calendar cards. */
export function TruncatedText({ children, className, title }: TruncatedTextProps) {
  const textTitle =
    title ?? (typeof children === "string" ? children : undefined);
  return (
    <span className={cn("block min-w-0 truncate", className)} title={textTitle}>
      {children}
    </span>
  );
}

/** Full text with responsive line breaks (hover popover + month side panel). */
export function WrappingText({ children, className }: TruncatedTextProps) {
  return (
    <span
      className={cn(
        "min-w-0 flex-1 break-words [overflow-wrap:anywhere]",
        className
      )}
    >
      {children}
    </span>
  );
}
