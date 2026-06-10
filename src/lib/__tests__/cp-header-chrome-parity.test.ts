import { describe, expect, it } from "vitest";
import {
  getControlPanelPageChromeConfig,
  CP_OVERVIEW_SUBTITLE_LEAD,
  CP_NOTIFICATIONS_SUBTITLE_LEAD,
} from "@/lib/control-panel-page-chrome-config";
import {
  getControlPanelHeaderActionShells,
  resolveHeaderActionIcon,
} from "@/lib/control-panel-header-actions-config";
import { getHeaderActionShellButtonClassName } from "@/lib/control-panel-header-action-shell-markup";
import { emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";

describe("control-panel-page-chrome-config C12 subtitles", () => {
  it("overview uses inline-metric lead (not legacy KPI blurb)", () => {
    const config = getControlPanelPageChromeConfig("overview");
    expect(config.description).toBe(CP_OVERVIEW_SUBTITLE_LEAD);
    expect(config.description).toContain("last updated");
  });

  it("notifications uses inline-metric lead", () => {
    const config = getControlPanelPageChromeConfig("notifications");
    expect(config.description).toBe(CP_NOTIFICATIONS_SUBTITLE_LEAD);
  });

  it("users_admin subtitle is inlined in config (no missing import file)", () => {
    const config = getControlPanelPageChromeConfig("users_admin");
    expect(config.description).toContain("B2B admin accounts");
  });
});

describe("control-panel-header-actions-config C12", () => {
  it("overview has Refresh SSR shell", () => {
    const shells = getControlPanelHeaderActionShells("overview", "actions");
    expect(shells.some((s) => s.label === "Refresh" && s.iconKey === "refresh")).toBe(true);
  });

  it("resolveHeaderActionIcon includes refresh", () => {
    expect(resolveHeaderActionIcon("refresh")).toBeDefined();
  });

  it("shell button class includes h-10 rhythm for primary actions", () => {
    const shells = getControlPanelHeaderActionShells("doctors", "actions");
    const cls = getHeaderActionShellButtonClassName({
      ...shells[0]!,
      className: emeraldGlassPrimaryButtonClass,
    });
    expect(cls).toContain("h-10");
    expect(cls).toContain("px-4");
  });
});
