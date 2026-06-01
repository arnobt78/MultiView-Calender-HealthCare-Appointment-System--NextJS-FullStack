/**
 * SSR-only patient portal shell — pulse slots while client page hydrates or prefetch missed.
 */

import { appPortalSectionRootClass } from "@/lib/section-page-layout";

const pulse = "animate-pulse rounded-lg bg-slate-200/80";

export function PatientPortalPageSkeleton() {
  return (
    <div className={appPortalSectionRootClass} aria-busy="true" aria-label="Loading patient portal">
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
        <div className={`h-12 w-12 rounded-2xl ${pulse}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-6 w-48 ${pulse}`} />
          <div className={`h-3 w-64 max-w-full ${pulse}`} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-20 rounded-[28px] ${pulse}`} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className={`md:col-span-1 h-72 rounded-[28px] ${pulse}`} />
        <div className={`md:col-span-2 h-72 rounded-[28px] ${pulse}`} />
      </div>
    </div>
  );
}
