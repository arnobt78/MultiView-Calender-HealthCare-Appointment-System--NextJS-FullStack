import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LandingPage from "@/components/pages/LandingPage";
import { SESSION } from "@/lib/constants";

export default async function Page() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(SESSION.COOKIE_NAME)?.value);

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
