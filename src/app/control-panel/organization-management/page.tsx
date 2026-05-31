export const dynamic = "force-dynamic";

import { ControlPanelSectionServerPage } from "@/components/control-panel/ControlPanelSectionServerPage";

export default function Page() {
  return ControlPanelSectionServerPage({ tab: "organizations" });
}
