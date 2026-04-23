import React from "react";

export default function AppointmentListSkeleton() {
  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 min-h-[calc(100vh-80px)] animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 w-48 bg-white/20 rounded-lg mb-3" />
      {/* Filter bar skeleton */}
      <div className="flex flex-row flex-wrap items-center gap-3 mb-2">
        <div className="h-10 flex-1 min-w-[200px] max-w-xl bg-white/15 rounded-2xl" />
        <div className="h-10 w-32 bg-white/15 rounded-2xl" />
        <div className="h-10 w-28 bg-white/15 rounded-2xl" />
        <div className="h-10 w-24 bg-white/15 rounded-2xl" />
        <div className="h-10 w-20 bg-white/15 rounded-2xl" />
      </div>
      {/* Date headline skeleton */}
      <div className="h-6 w-56 bg-white/20 rounded mt-8 mb-3" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="relative rounded-2xl bg-white/90 border border-white/25 p-0 flex items-stretch min-h-[130px]"
          >
            <div className="w-1.5 rounded-l-2xl h-full absolute left-0 top-0 bottom-0 bg-gray-200" />
            <div className="pl-6 pr-4 py-4 flex-1 flex flex-col gap-2">
              {/* Title + badge */}
              <div className="flex items-center gap-2">
                <div className="h-5 w-36 bg-gray-200 rounded-lg" />
                <div className="h-5 w-20 bg-gray-100 rounded-full" />
              </div>
              {/* Date + time */}
              <div className="flex items-center gap-4">
                <div className="h-4 w-28 bg-gray-100 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
              </div>
              {/* 2-col metadata grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="h-3.5 w-32 bg-gray-100 rounded" />
                <div className="h-3.5 w-28 bg-gray-100 rounded" />
                <div className="h-3.5 w-24 bg-gray-100 rounded" />
                <div className="h-3.5 w-20 bg-gray-100 rounded" />
              </div>
            </div>
            {/* Actions column */}
            <div className="flex flex-col items-center justify-center gap-3 min-w-[68px] py-4 px-3 border-l border-gray-100">
              <div className="h-9 w-20 bg-gray-150 rounded-2xl" />
              <div className="h-8 w-8 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
