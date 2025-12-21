import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Status",
  description: "Check the health status and availability of all API endpoints in the Doctor Patient Calendar system. Monitor uptime, endpoint status, and deployment information.",
  keywords: ["API status", "health check", "endpoint status", "API monitoring", "system status", "uptime"],
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApiStatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

