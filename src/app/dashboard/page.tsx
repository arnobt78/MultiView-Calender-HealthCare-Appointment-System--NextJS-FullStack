// Dashboard page — Server Component (async)
// force-dynamic in layout.tsx means useSearchParams() in HomePage works without
// Suspense, so we no longer need the Suspense boundary or the DashboardPageSkeleton
// fallback. We pre-fetch categories and patients here so they land in the TanStack
// Query cache before the first client render — eliminating the sub-fetch waterfall
// that useAppointments triggers internally via ensureQueryData.

import HomePage from "@/components/pages/HomePage";
import { getSessionUser } from "@/lib/session";
import { prefetchCategories, prefetchPatients } from "@/lib/server-prefetch";
import type { Category, Patient } from "@/types/types";

export default async function DashboardPage() {
  const session = await getSessionUser();

  // Pre-fetch supporting data only when authenticated; unauthenticated requests
  // are redirected by the proxy / AuthShell before reaching this point.
  let initialCategories: Category[] | null = null;
  let initialPatients: Patient[] | null = null;

  if (session) {
    [initialCategories, initialPatients] = await Promise.all([
      prefetchCategories(),
      prefetchPatients(),
    ]);
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      {/*
       * No Suspense needed — force-dynamic in layout.tsx makes useSearchParams()
       * work without a Suspense boundary. Initial data is seeded into the
       * TanStack Query cache by HomePage's useLayoutEffect so first paint shows
       * real data (or inline skeletons) with no extra network round-trip.
       */}
      <HomePage
        initialCategories={initialCategories}
        initialPatients={initialPatients}
      />
    </div>
  );
}
