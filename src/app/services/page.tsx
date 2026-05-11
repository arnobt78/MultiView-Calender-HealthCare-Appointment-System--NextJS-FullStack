/**
 * /services — Doctors & Appointment Types (services) directory
 *
 * Accessible to all authenticated roles. Server component for metadata/layout;
 * data fetching is delegated to the ServicesPage client component.
 */

import type { Metadata } from "next";
import ServicesPage from "@/components/pages/ServicesPage";

export const metadata: Metadata = {
  title: "Doctors & Services",
  description: "Browse our specialist doctors and available appointment types",
};

export default function Page() {
  return <ServicesPage />;
}
