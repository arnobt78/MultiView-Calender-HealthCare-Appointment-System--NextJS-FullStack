// Legacy / unknown segment → canonical dedicated list route (no 15-tab ControlPanelPage mount).

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import {
  CONTROL_PANEL_SEGMENT_TO_TAB,
  CONTROL_PANEL_TAB_TO_SEGMENT,
} from "@/lib/control-panel-nav-config";

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const tab = CONTROL_PANEL_SEGMENT_TO_TAB[section];
  if (!tab) {
    redirect("/control-panel/dashboard-overview");
  }
  const canonical = CONTROL_PANEL_TAB_TO_SEGMENT[tab] ?? "dashboard-overview";
  redirect(`/control-panel/${canonical}`);
}
