// Accept Invitation Page - Server Component (SSR)
// Route entry point that renders the client-side AcceptInvitationPage component

import { Suspense } from "react";
import AcceptInvitationPage from "@/components/pages/AcceptInvitationPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading invitation...</div>}>
      <AcceptInvitationPage />
    </Suspense>
  );
}
