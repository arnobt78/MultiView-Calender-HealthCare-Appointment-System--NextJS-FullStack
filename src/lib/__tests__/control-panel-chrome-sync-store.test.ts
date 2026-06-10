import { describe, expect, it, beforeEach } from "vitest";
import {
  __resetControlPanelChromeSyncStoreForTests,
  getControlPanelChromeServerSnapshot,
  getControlPanelChromeSnapshot,
  registerControlPanelChromeSlice,
  reinitializeControlPanelChromeTab,
  resetControlPanelChromeRegistry,
  setControlPanelChromeActiveTab,
  subscribeControlPanelChrome,
  notifyControlPanelChromeRegistry,
} from "@/lib/control-panel-chrome-sync-store";

describe("control-panel-chrome-sync-store C12.1 tab isolation", () => {
  beforeEach(() => {
    __resetControlPanelChromeSyncStoreForTests();
  });

  it("server snapshot matches client after same-tab register", () => {
    setControlPanelChromeActiveTab("overview");
    registerControlPanelChromeSlice("overview", {
      description: "Overview subtitle",
    });
    expect(getControlPanelChromeServerSnapshot()).toEqual(
      getControlPanelChromeSnapshot()
    );
    expect(getControlPanelChromeServerSnapshot().registry.description).toBe(
      "Overview subtitle"
    );
  });

  it("switching active tab clears previous tab description", () => {
    setControlPanelChromeActiveTab("overview");
    registerControlPanelChromeSlice("overview", {
      description: "Real-time system summary — last updated 12:00:00",
    });
    expect(getControlPanelChromeSnapshot().registry.description).toBeTruthy();

    setControlPanelChromeActiveTab("telehealth");
    expect(getControlPanelChromeSnapshot().registry.description).toBeNull();
    expect(getControlPanelChromeSnapshot().tab).toBeNull();
  });

  it("partial register on new tab does not retain previous tab description", () => {
    setControlPanelChromeActiveTab("overview");
    registerControlPanelChromeSlice("overview", {
      description: "Overview dynamic subtitle",
      actions: "Refresh",
    });

    setControlPanelChromeActiveTab("telehealth");
    registerControlPanelChromeSlice("telehealth", {
      actions: "Filter buttons",
    });

    const snap = getControlPanelChromeSnapshot();
    expect(snap.tab).toBe("telehealth");
    expect(snap.registry.actions).toBe("Filter buttons");
    expect(snap.registry.description).toBeNull();
  });

  it("register does not emit during render — notifyControlPanelChromeRegistry does", () => {
    let calls = 0;
    const unsub = subscribeControlPanelChrome(() => {
      calls += 1;
    });

    setControlPanelChromeActiveTab("overview");
    registerControlPanelChromeSlice("overview", {
      actions: "Refresh idle",
    });
    expect(calls).toBe(0);

    notifyControlPanelChromeRegistry();
    expect(calls).toBe(1);

    registerControlPanelChromeSlice("overview", {
      actions: "Refresh loading",
    });
    expect(calls).toBe(1);

    notifyControlPanelChromeRegistry();
    expect(calls).toBe(2);

    unsub();
  });

  it("ignores slice registration when tab does not match active tab", () => {
    setControlPanelChromeActiveTab("patients");
    registerControlPanelChromeSlice("overview", {
      description: "Stale overview",
    });
    expect(getControlPanelChromeSnapshot().registry.description).toBeNull();
  });

  it("detail route return — reset clears activeTab; reinitialize + register restores actions", () => {
    setControlPanelChromeActiveTab("users_admin");
    registerControlPanelChromeSlice("users_admin", {
      actions: "Add Admin live",
    });
    expect(getControlPanelChromeSnapshot().registry.actions).toBe("Add Admin live");

    resetControlPanelChromeRegistry();
    expect(getControlPanelChromeSnapshot().registry.actions).toBeNull();

    setControlPanelChromeActiveTab("users_admin");
    expect(getControlPanelChromeSnapshot().registry.actions).toBeNull();

    reinitializeControlPanelChromeTab("users_admin");
    registerControlPanelChromeSlice("users_admin", {
      actions: "Add Admin live",
    });
    notifyControlPanelChromeRegistry();

    expect(getControlPanelChromeSnapshot().tab).toBe("users_admin");
    expect(getControlPanelChromeSnapshot().registry.actions).toBe("Add Admin live");
  });
});
