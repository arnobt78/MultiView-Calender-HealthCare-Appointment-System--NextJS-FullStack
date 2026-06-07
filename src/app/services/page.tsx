/**
 * /services — Doctors & Appointment Types directory
 *
 * Server component: prefetches doctors and merged service catalog on the server
 * so the page renders without a loading flash. Data is passed as initialXxx props
 * and seeded into the React Query cache via useLayoutEffect in the client component.
 */

import type { Metadata } from "next";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import ServicesPage from "@/components/pages/ServicesPage";
import {
  prefetchAppointmentServiceCatalog,
  prefetchDoctors,
  type DoctorPrefetchRow,
} from "@/lib/server-prefetch";
import type { ServiceCatalogRow } from "@/lib/appointment-service-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Doctors & Services",
  description: "Browse our specialist doctors and available appointment types",
};

export default async function Page() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  const [doctorsResult, initialServiceCatalog] = await Promise.all([
    prefetchDoctors(),
    prefetchAppointmentServiceCatalog(),
  ]);

  return (
    <ServicesPage
      initialDoctors={(doctorsResult?.doctors ?? undefined) as DoctorPrefetchRow[] | undefined}
      initialServiceCatalog={(initialServiceCatalog ?? undefined) as ServiceCatalogRow[] | undefined}
    />
  );
}
