/**
 * Root page — always renders the public landing page.
 *
 * Route protection (redirect authenticated users to /dashboard) is now
 * handled at the edge by src/middleware.ts, so no cookie check is needed here.
 */
import LandingPage from "@/components/pages/LandingPage";

export default function Page() {
  return <LandingPage />;
}
