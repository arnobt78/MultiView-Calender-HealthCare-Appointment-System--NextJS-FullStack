import { describe, expect, it } from "vitest";
import {
  APP_INNER_SCROLL_STICKY_TOP_CLASS,
  APP_MAIN_OFFSET_CLASS,
  APP_NAVBAR_HEIGHT_CSS_VAR,
  APP_NAVBAR_HEIGHT_FALLBACK,
  APP_NAVBAR_INNER_ROW_CLASS,
  APP_NAVBAR_OFFSET_CLASS,
  APP_NAVBAR_STICKY_OFFSET_CLASS,
} from "@/lib/portal-z-index";

describe("portal-z-index navbar offset contract", () => {
  it("main offset uses measured navbar CSS variable with SSR fallback", () => {
    expect(APP_MAIN_OFFSET_CLASS).toContain(`var(${APP_NAVBAR_HEIGHT_CSS_VAR}`);
    expect(APP_MAIN_OFFSET_CLASS).toContain(APP_NAVBAR_HEIGHT_FALLBACK);
    expect(APP_NAVBAR_OFFSET_CLASS).toBe(APP_MAIN_OFFSET_CLASS);
  });

  it("document-scroll sticky uses the same navbar height token", () => {
    expect(APP_NAVBAR_STICKY_OFFSET_CLASS).toContain(`var(${APP_NAVBAR_HEIGHT_CSS_VAR}`);
    expect(APP_INNER_SCROLL_STICKY_TOP_CLASS).toBe("top-0");
  });

  it("navbar inner row matches fallback base height", () => {
    expect(APP_NAVBAR_INNER_ROW_CLASS).toBe("min-h-14");
    expect(APP_NAVBAR_HEIGHT_FALLBACK).toContain("3.5rem");
  });
});
