// Control Panel Page - Server Component (SSR)
// Fetches session on the server and passes to client to avoid one client round-trip

import ControlPanelPage from "@/components/pages/ControlPanelPage";
import { getSessionUser } from "@/lib/session";

export default async function Page() {
  const sessionUser = await getSessionUser();
  return <ControlPanelPage initialSession={sessionUser} />;
}
