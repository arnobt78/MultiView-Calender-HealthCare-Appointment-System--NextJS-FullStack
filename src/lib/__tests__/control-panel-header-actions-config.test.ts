import { describe, expect, it } from "vitest";
import {
  getControlPanelHeaderActionShells,
  resolveHeaderActionIcon,
} from "@/lib/control-panel-header-actions-config";

describe("control-panel-header-actions-config", () => {
  it("filters shells by actions slot", () => {
    const shells = getControlPanelHeaderActionShells("patients", "actions");
    expect(shells.length).toBe(2);
    expect(shells.every((s) => s.slot === "actions")).toBe(true);
  });

  it("organizations Create shell is in actions slot", () => {
    const shells = getControlPanelHeaderActionShells("organizations", "actions");
    expect(shells.some((s) => s.label.includes("Create Organization"))).toBe(true);
  });

  it("resolveHeaderActionIcon returns component for each key", () => {
    expect(resolveHeaderActionIcon("download")).toBeDefined();
    expect(resolveHeaderActionIcon("building2")).toBeDefined();
  });
});
