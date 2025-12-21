import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "Complete API documentation for the Doctor Patient Calendar Appointment Management System. Explore RESTful endpoints for appointments, invitations, permissions, and user management with OpenAPI specification.",
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
    description: "Complete API documentation for the Doctor Patient Calendar system with OpenAPI specification.",
    type: "website",
  },
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

