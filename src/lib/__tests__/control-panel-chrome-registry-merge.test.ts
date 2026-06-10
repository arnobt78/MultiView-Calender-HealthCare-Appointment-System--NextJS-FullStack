import { describe, expect, it } from "vitest";
import { EMPTY_CONTROL_PANEL_CHROME_REGISTRY } from "@/components/control-panel/ControlPanelChromeContext";
import { mergeControlPanelChromeRegistrySlice } from "@/lib/control-panel-chrome-registry-merge";

describe("mergeControlPanelChromeRegistrySlice", () => {
  it("merges description without clearing other slots", () => {
    const prev = {
      ...EMPTY_CONTROL_PANEL_CHROME_REGISTRY,
      actions: "Refresh",
    };
    const next = mergeControlPanelChromeRegistrySlice(prev, {
      description: "Overview subtitle",
    });
    expect(next?.description).toBe("Overview subtitle");
    expect(next?.actions).toBe("Refresh");
  });

  it("returns null when slice is unchanged", () => {
    const prev = {
      ...EMPTY_CONTROL_PANEL_CHROME_REGISTRY,
      description: "Same",
    };
    expect(
      mergeControlPanelChromeRegistrySlice(prev, { description: "Same" })
    ).toBeNull();
  });

  it("partial register on new tab does not retain previous description", () => {
    const afterOverview = mergeControlPanelChromeRegistrySlice(
      EMPTY_CONTROL_PANEL_CHROME_REGISTRY,
      { description: "Overview dynamic subtitle", actions: "Refresh" }
    )!;
    const afterTelehealth = mergeControlPanelChromeRegistrySlice(
      EMPTY_CONTROL_PANEL_CHROME_REGISTRY,
      { actions: "Filter buttons" }
    )!;
    expect(afterTelehealth.actions).toBe("Filter buttons");
    expect(afterTelehealth.description).toBeNull();
    expect(afterOverview.description).toBeTruthy();
  });
});
