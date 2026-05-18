import React from "react";

/**
 * HomePageSkeleton - Server-rendered skeleton placeholder for the home/calendar page.
 * Matches the exact layout dimensions of CalendarHeader + AppointmentList.
 * Uses CSS-only animate-pulse for the loading effect.
 */
export default function HomePageSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-visible">
      <div className="shrink-0 px-2 py-3 sm:px-4 lg:px-8">
        {/* CalendarHeader skeleton */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-9 w-9 animate-pulse rounded-xl border bg-gray-100" />
              <div className="h-6 min-w-[170px] animate-pulse rounded-md bg-gray-200" />
              <div className="h-9 w-9 animate-pulse rounded-xl border bg-gray-100" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="h-10 w-16 animate-pulse rounded-full bg-gray-200" />
              <div className="h-10 w-16 animate-pulse rounded-full bg-gray-200" />
              <div className="h-10 w-16 animate-pulse rounded-full bg-gray-200" />
              <div className="h-10 w-16 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div className="h-10 w-28 animate-pulse rounded-full bg-gray-200" />
            <div className="h-10 w-36 animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>

        {/* Filters row shell */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="h-10 w-full animate-pulse rounded-2xl bg-gray-200 sm:max-w-sm" />
          <div className="h-10 w-36 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-10 w-32 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-10 w-32 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-10 w-32 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>

      <div className="inner-dashboard-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-2 pb-8 sm:px-4 lg:px-8">
        {/* Badge row shell */}
        <div className="mb-2 flex flex-wrap items-center gap-2 pt-0">
          <div className="h-7 w-36 animate-pulse rounded-md bg-gray-200" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
          ))}
        </div>

        {/* AppointmentList skeleton */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="relative border rounded-2xl shadow bg-white p-0 flex items-stretch min-h-[110px]"
              >
                <div className="w-2 rounded-l-xl h-full absolute left-0 top-0 bottom-0 bg-gray-200 animate-pulse" />
                <div className="pl-6 pr-2 py-4 flex-1 flex flex-col justify-center min-h-[110px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
                    <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1 mb-1">
                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-40 bg-gray-100 rounded mb-1 animate-pulse" />
                  <div className="h-4 w-28 bg-gray-100 rounded mb-1 animate-pulse" />
                  <div className="h-4 w-32 bg-gray-100 rounded mb-1 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
