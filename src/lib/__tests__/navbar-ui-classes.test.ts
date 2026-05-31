import { describe, expect, it } from "vitest";
import {
  navbarCenterNavClass,
  navbarNavLinkClass,
} from "@/lib/navbar-ui-classes";

describe("navbar-ui-classes", () => {
  it("keeps center nav links on one row for admin labels", () => {
    expect(navbarCenterNavClass).toContain("flex-nowrap");
    expect(navbarNavLinkClass).toContain("whitespace-nowrap");
    expect(navbarNavLinkClass).toContain("shrink-0");
  });
});
