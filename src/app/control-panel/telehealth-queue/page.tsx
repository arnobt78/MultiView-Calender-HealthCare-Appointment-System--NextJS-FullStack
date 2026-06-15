export const dynamic = "force-dynamic";

import { ControlPanelSectionServerPage } from "@/components/control-panel/ControlPanelSectionServerPage";

/** SSR seeds appointments bundle; client filters `is_telehealth` only. */
export default function Page() {
  return ControlPanelSectionServerPage({ tab: "telehealth" });
}
