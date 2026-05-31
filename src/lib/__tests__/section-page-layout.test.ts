import { describe, expect, it } from "vitest";
import {
  appEntityDetailRootClass,
  appPortalSectionRootClass,
  appSectionRootClass,
  resolveAppSectionRootClass,
} from "@/lib/section-page-layout";

describe("section-page-layout", () => {
  it("uses pb-3 only on control-panel scroll shell", () => {
    expect(appSectionRootClass).toContain("pb-3");
    expect(appPortalSectionRootClass).not.toContain("pb-3");
    expect(resolveAppSectionRootClass("control-panel")).toBe(appSectionRootClass);
    expect(resolveAppSectionRootClass("portal")).toBe(appPortalSectionRootClass);
  });

  it("keeps entity detail footer clearance", () => {
    expect(appEntityDetailRootClass).toContain("pb-24");
    expect(appEntityDetailRootClass).toContain("space-y-3");
  });
});
