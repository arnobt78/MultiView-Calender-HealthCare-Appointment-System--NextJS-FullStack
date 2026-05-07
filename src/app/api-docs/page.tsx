// API Docs Page - Server Component (SSR)
// Route entry point: exports page metadata and renders ApiDocsPage.
// Metadata moved here from the now-deleted api-docs/layout.tsx.

import type { Metadata } from "next";
import ApiDocsPage from "@/components/pages/ApiDocsPage";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "Complete API documentation for the Doctor Patient Calendar Appointment Management System. Explore RESTful endpoints for appointments, invitations, permissions, and user management with OpenAPI specification.",
  keywords: [
    "API documentation",
    "RESTful API",
    "OpenAPI",
    "calendar API",
    "appointment API",
    "API endpoints",
    "developer documentation",
    "API reference",
  ],
  openGraph: {
    title: "API Documentation | Doctor Patient Calendar",
    description:
      "Complete API documentation for the Doctor Patient Calendar system with OpenAPI specification.",
    type: "website",
  },
};

export default function Page() {
  return <ApiDocsPage />;
}