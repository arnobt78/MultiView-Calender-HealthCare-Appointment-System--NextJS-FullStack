import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Control Panel",
  description: "Manage invitations, permissions, and access control for appointments and dashboards in the Doctor Patient Calendar system.",
  keywords: ["control panel", "permissions", "invitations", "access control", "appointment management", "dashboard access"],
  robots: {
    index: false,
    follow: false,
  },
};

export default function ControlPanelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

