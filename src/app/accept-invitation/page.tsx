// Accept Invitation Page - Server Component (SSR)
// Route entry point that renders the client-side AcceptInvitationPage component

import AcceptInvitationPage from "@/components/pages/AcceptInvitationPage";

type AcceptInvitationPageRouteProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function Page({ searchParams }: AcceptInvitationPageRouteProps) {
  const { token } = await searchParams;
  return <AcceptInvitationPage token={token ?? null} />;
}
