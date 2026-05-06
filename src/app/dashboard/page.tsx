import { Suspense } from "react";
import HomePage from "@/components/pages/HomePage";

/**
 * DashboardPageSkeleton — static fallback rendered by the Suspense boundary while
 * HomePage suspends (caused by useSearchParams() in Next.js App Router).
 *
 * Mirrors the exact markup that AppointmentList renders during `loadingAppointments`:
 *   - A sticky-header strip with title + stat badge placeholders
 *   - 3 pulse skeleton appointment cards
 *
 * This eliminates the "only navbar visible, rest blank" flash that was caused by
 * `fallback={null}` showing nothing during the suspension window.
 */
function DashboardPageSkeleton() {
  return (
    <div className="pt-0 px-2 sm:px-4 lg:px-8 pb-8">
      {/* Sticky header strip placeholder — matches CalendarStickyHeader layout */}
      <div className="mb-2 flex flex-wrap items-center gap-2 py-2">
        {/* Title placeholder */}
        <div className="h-7 w-40 animate-pulse rounded-lg bg-gray-200" />
        {/* Stat badge placeholders (Total, Today, Tomorrow, Later, Passed, Open, Alert, Done) */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
        ))}
      </div>

      {/* Filters row placeholder */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="h-8 w-32 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-8 w-28 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-8 w-28 animate-pulse rounded-xl bg-gray-100" />
      </div>

      {/* Skeleton appointment cards — identical to AppointmentList's animate-pulse block */}
      <div className="animate-pulse mt-8 flex flex-col gap-4">
        <div className="h-6 w-56 bg-gray-200 rounded mb-1" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="relative rounded-2xl bg-white border border-gray-100 flex items-stretch min-h-[130px]"
          >
            <div className="w-1.5 rounded-l-2xl h-full absolute left-0 top-0 bottom-0 bg-gray-200" />
            <div className="pl-6 pr-4 py-4 flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-36 bg-gray-200 rounded-2xl" />
                <div className="h-5 w-20 bg-gray-100 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-28 bg-gray-100 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="h-3.5 w-32 bg-gray-100 rounded" />
                <div className="h-3.5 w-28 bg-gray-100 rounded" />
                <div className="h-3.5 w-24 bg-gray-100 rounded" />
                <div className="h-3.5 w-20 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 min-w-[68px] py-4 px-3 border-l border-gray-100">
              <div className="h-9 w-20 bg-gray-100 rounded-2xl" />
              <div className="h-8 w-8 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      {/*
       * Suspense boundary required because HomePage uses useSearchParams().
       * Previously fallback={null} caused a blank content area during the suspension window
       * (only Navbar was visible). DashboardPageSkeleton renders immediately and matches
       * the AppointmentList loading state so the transition is invisible.
       */}
      <Suspense fallback={<DashboardPageSkeleton />}>
        <HomePage />
      </Suspense>
    </div>
  );
}
