/**
 * /services — Doctors & Appointment Types directory
 *
 * Server component: prefetches doctors and global appointment types on the server
 * so the page renders without a loading flash. Data is passed as initialXxx props
 * and seeded into the React Query cache via useLayoutEffect in the client component.
 */

import type { Metadata } from "next";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import ServicesPage from "@/components/pages/ServicesPage";
import { prefetchDoctors, prefetchGlobalAppointmentTypes, type DoctorPrefetchRow, type GlobalAppointmentType } from "@/lib/server-prefetch";

export const metadata: Metadata = {
  title: "Doctors & Services",
  description: "Browse our specialist doctors and available appointment types",
};

export default async function Page() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  const [doctorsResult, initialGlobalTypes] = await Promise.all([
    prefetchDoctors(),
    prefetchGlobalAppointmentTypes(),
  ]);

  return (
    <ServicesPage
      initialDoctors={(doctorsResult?.doctors ?? undefined) as DoctorPrefetchRow[] | undefined}
      initialGlobalTypes={(initialGlobalTypes ?? undefined) as GlobalAppointmentType[] | undefined}
    />
  );
}
