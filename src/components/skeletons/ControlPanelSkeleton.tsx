import React from "react";

/**
 * ControlPanelSkeleton - Server-rendered skeleton placeholder for the Control Panel page.
 * Matches the exact layout dimensions of the sidebar + main content area with tab buttons.
 * Uses CSS-only animate-pulse for the loading effect.
 */
export default function ControlPanelSkeleton() {
  return (
    <div className="flex min-h-screen animate-pulse">
      {/* Sidebar skeleton */}
      <aside className="bg-white border-r w-64 flex flex-col">
        <div className="p-2 m-2 self-end">
          <div className="h-8 w-8 bg-gray-200 rounded" />
        </div>
        <nav className="flex-1 flex flex-col gap-2 p-2">
          <div className="h-10 w-full bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-100 rounded" />
        </nav>
      </aside>
      {/* Main Content skeleton */}
      <main className="flex-1 p-8">
        {/* Permission section skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4" />
          <div className="bg-white rounded-2xl border p-6 space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-100 rounded" />
            <div className="h-10 w-32 bg-gray-200 rounded" />
          </div>
          {/* Invitation list skeleton */}
          <div className="space-y-3 mt-6">
            <div className="h-6 w-40 bg-gray-200 rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
