import { describe, expect, it } from "vitest";
import {
  appEntityDetailBodyStackClass,
  appEntityDetailRootClass,
  appPortalEntityDetailRootClass,
  appPortalSectionRootClass,
  appSectionRootClass,
  resolveAppSectionRootClass,
  resolveEntityDetailRootClass,
} from "@/lib/section-page-layout";

describe("section-page-layout", () => {
  it("uses pb-3 only on control-panel scroll shell", () => {
    expect(appSectionRootClass).toContain("pb-3");
    expect(appPortalSectionRootClass).not.toContain("pb-3");
    expect(resolveAppSectionRootClass("control-panel")).toBe(appSectionRootClass);
    expect(resolveAppSectionRootClass("portal")).toBe(appPortalSectionRootClass);
  });

  it("uses dashboard-overview single scroll for entity detail", () => {
    expect(appEntityDetailRootClass).toContain("pb-3");
    expect(appEntityDetailRootClass).not.toContain("space-y-3");
    expect(appEntityDetailBodyStackClass).toContain("space-y-3");
    expect(appEntityDetailRootClass).not.toContain("overflow-y-auto");
    expect(appPortalEntityDetailRootClass).not.toContain("space-y-3");
    expect(appPortalEntityDetailRootClass).not.toContain("pb-3");
    expect(resolveEntityDetailRootClass("control-panel")).toBe(appEntityDetailRootClass);
    expect(resolveEntityDetailRootClass("portal")).toBe(appPortalEntityDetailRootClass);
  });
});
