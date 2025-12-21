import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept Invitation",
  description: "Accept an invitation to access appointments or dashboard in the Doctor Patient Calendar system.",
  keywords: ["accept invitation", "invitation", "calendar invitation", "appointment invitation", "dashboard access"],
  robots: {
    index: false,
    follow: false,
  },
};

export default function AcceptInvitationLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
