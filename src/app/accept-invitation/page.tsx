// Accept Invitation Page - Server Component (SSR)
// Route entry point: exports page metadata and renders the client AcceptInvitationPage.
// Metadata moved here from the now-deleted accept-invitation/layout.tsx.

import type { Metadata } from "next";
import AcceptInvitationPage from "@/components/pages/AcceptInvitationPage";

export const metadata: Metadata = {
  title: "Accept Invitation",
  description:
    "Accept an invitation to access appointments or dashboard in the Doctor Patient Calendar system.",
  keywords: [
    "accept invitation",
    "invitation",
    "calendar invitation",
    "appointment invitation",
    "dashboard access",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

type AcceptInvitationPageRouteProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function Page({ searchParams }: AcceptInvitationPageRouteProps) {
  const { token } = await searchParams;
  return <AcceptInvitationPage token={token ?? null} />;
}
