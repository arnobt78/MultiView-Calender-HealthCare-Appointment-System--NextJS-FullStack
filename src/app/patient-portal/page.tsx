// Patient Portal — SSR route
// Passes SSR session to client PatientPortalPage component

import PatientPortalPage from "@/components/pages/PatientPortalPage";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Patient Portal — Vocare" };

export default async function PatientPortalRoute() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  return <PatientPortalPage />;
}
