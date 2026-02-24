import React from "react";

/**
 * ApiStatusSkeleton - Server-rendered skeleton placeholder for the API Status page.
 * Matches the exact layout dimensions of the status page: title, info rows, endpoints list.
 * Uses CSS-only animate-pulse for the loading effect.
 */
export default function ApiStatusSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-pulse">
      {/* Title */}
      <div className="h-9 w-64 bg-gray-200 rounded mb-6" />

      {/* Project */}
      <div className="mb-4">
        <div className="h-5 w-20 bg-gray-200 rounded mb-1" />
        <div className="h-5 w-36 bg-gray-100 rounded" />
      </div>

      {/* Environment */}
      <div className="mb-4">
        <div className="h-5 w-28 bg-gray-200 rounded mb-1" />
        <div className="h-5 w-24 bg-gray-100 rounded" />
      </div>

      {/* Current Time */}
      <div className="mb-4">
        <div className="h-5 w-28 bg-gray-200 rounded mb-1" />
        <div className="h-5 w-48 bg-gray-100 rounded" />
      </div>

      {/* Uptime */}
      <div className="mb-4">
        <div className="h-5 w-16 bg-gray-200 rounded mb-1" />
        <div className="h-5 w-12 bg-gray-100 rounded" />
      </div>

      {/* API Health */}
      <div className="mb-4">
        <div className="h-5 w-24 bg-gray-200 rounded mb-1" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-200 rounded-full" />
          <div className="h-5 w-24 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Endpoints */}
      <div className="mb-4">
        <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-200 rounded-full" />
              <div className="h-4 w-40 bg-gray-100 rounded" />
              <div className="h-3 w-48 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Deployment */}
      <div className="mb-4">
        <div className="h-5 w-24 bg-gray-200 rounded mb-1" />
        <div className="h-5 w-36 bg-gray-100 rounded" />
      </div>

      {/* Last checked */}
      <div className="mt-8">
        <div className="h-3 w-48 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
