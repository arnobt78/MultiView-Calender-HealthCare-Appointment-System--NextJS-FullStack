/**
 * SSR-only doctor portal shell — pulse slots when portal prefetch is unavailable.
 */

import { appPortalSectionRootClass } from "@/lib/section-page-layout";

const pulse = "animate-pulse rounded-lg bg-slate-200/80";

export function DoctorPortalPageSkeleton() {
  return (
    <div className={appPortalSectionRootClass} aria-busy="true" aria-label="Loading doctor portal">
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
        <div className={`h-14 w-14 rounded-2xl ${pulse}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-6 w-40 ${pulse}`} />
          <div className={`h-4 w-28 ${pulse}`} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-20 rounded-[28px] ${pulse}`} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`h-56 rounded-[28px] ${pulse}`} />
        <div className={`h-56 rounded-[28px] ${pulse}`} />
      </div>
      <div className={`h-40 rounded-[28px] ${pulse}`} />
    </div>
  );
}
