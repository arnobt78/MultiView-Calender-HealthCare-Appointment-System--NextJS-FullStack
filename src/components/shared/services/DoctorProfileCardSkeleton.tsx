"use client";

import { CalendarClock, CalendarPlus, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 1:1 loading shell for `DoctorProfileCard` on `/services` — static card chrome, pulse only data lines.
 * Hero uses fixed `h-44` block (images load in real cards via `DoctorCardHeroImage`).
 */
export function DoctorProfileCardSkeleton() {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-[20px] border-0 bg-card p-0 shadow-[0_4px_24px_rgba(2,132,199,0.09)]">
      <Skeleton className="h-44 w-full shrink-0 rounded-none" aria-hidden />

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-32 rounded-sm" />
          <Skeleton className="h-3 w-40 rounded-sm" />
        </div>
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-3 w-full rounded-sm" />
        <Skeleton className="h-3 w-4/5 rounded-sm" />

        <div className="space-y-2">
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Availability
          </p>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full max-w-[12rem] rounded-sm" />
            <Skeleton className="h-5 w-full max-w-[10rem] rounded-sm" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden />
            <Skeleton className="h-3 w-16 rounded-sm" />
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden />
            <Skeleton className="h-3 w-12 rounded-sm" />
          </span>
        </div>

        <div className="flex-1" />

        <Button
          type="button"
          size="sm"
          disabled
          className="pointer-events-none w-full gap-2 bg-sky-600/80 text-white shadow-none"
          aria-hidden
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          <Skeleton className="h-3.5 w-28 rounded-sm bg-sky-400/50" />
        </Button>
      </CardContent>
    </Card>
  );
}
