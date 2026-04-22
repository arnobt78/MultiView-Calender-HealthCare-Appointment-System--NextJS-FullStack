import { cookies } from "next/headers";
import HomePage from "@/components/pages/HomePage";
import LandingPage from "@/components/pages/LandingPage";
import { SESSION } from "@/lib/constants";

export default async function Page() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(SESSION.COOKIE_NAME)?.value);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <HomePage />;
}
