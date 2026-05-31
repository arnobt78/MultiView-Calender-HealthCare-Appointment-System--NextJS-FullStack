import { describe, expect, it } from "vitest";
import {
  APP_INNER_SCROLL_STICKY_TOP_CLASS,
  APP_MAIN_OFFSET_CLASS,
  APP_NAVBAR_INNER_ROW_CLASS,
  APP_NAVBAR_OFFSET_CLASS,
  APP_NAVBAR_STICKY_OFFSET_CLASS,
} from "@/lib/portal-z-index";

describe("portal-z-index navbar offset contract", () => {
  it("main offset clears min-h-14 navbar row, border, and page-chrome top band", () => {
    expect(APP_MAIN_OFFSET_CLASS).toContain("3.5rem");
    expect(APP_MAIN_OFFSET_CLASS).toContain("1px");
    expect(APP_MAIN_OFFSET_CLASS).toContain("0.5rem");
    expect(APP_NAVBAR_OFFSET_CLASS).toBe(APP_MAIN_OFFSET_CLASS);
  });

  it("sticky tokens distinguish document scroll vs inner CP scroll", () => {
    expect(APP_NAVBAR_STICKY_OFFSET_CLASS).toContain("3.5rem");
    expect(APP_INNER_SCROLL_STICKY_TOP_CLASS).toBe("top-0");
  });

  it("navbar inner row matches offset base height", () => {
    expect(APP_NAVBAR_INNER_ROW_CLASS).toBe("min-h-14");
  });
});
