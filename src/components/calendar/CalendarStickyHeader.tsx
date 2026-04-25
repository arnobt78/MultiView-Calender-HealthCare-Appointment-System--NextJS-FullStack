"use client";

import { cn } from "@/lib/utils";

export default function CalendarStickyHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-3 bg-transparent",
        className
      )}
    >
      {children}
    </div>
  );
}
