import { describe, expect, it } from "vitest";
import {
  controlPanelListHrefForTab,
  navigateControlPanelSectionList,
} from "@/lib/control-panel-section-nav";

describe("controlPanelListHrefForTab", () => {
  it("maps tab values to list routes", () => {
    expect(controlPanelListHrefForTab("patients")).toBe("/control-panel/patient-management");
    expect(controlPanelListHrefForTab("categories")).toBe("/control-panel/category-management");
  });
});

describe("navigateControlPanelSectionList", () => {
  it("replaces when pathname is a detail sub-route", () => {
    const calls: string[] = [];
    navigateControlPanelSectionList(
      "/control-panel/patients/abc-123",
      "patients",
      (href) => calls.push(href)
    );
    expect(calls).toEqual(["/control-panel/patient-management"]);
  });

  it("skips replace when already on list route", () => {
    const calls: string[] = [];
    navigateControlPanelSectionList(
      "/control-panel/patient-management",
      "patients",
      (href) => calls.push(href)
    );
    expect(calls).toEqual([]);
  });
});
