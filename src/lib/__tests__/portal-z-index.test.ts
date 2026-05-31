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
  it("uses literal globals.css classes (Tailwind JIT must not build var() arbitrary strings)", () => {
    expect(APP_MAIN_OFFSET_CLASS).toBe("app-main-offset");
    expect(APP_NAVBAR_STICKY_OFFSET_CLASS).toBe("app-navbar-sticky-top");
    expect(APP_NAVBAR_OFFSET_CLASS).toBe(APP_MAIN_OFFSET_CLASS);
  });

  it("documents CSS variable + SSR fallback for navbar height sync", () => {
    expect(APP_NAVBAR_HEIGHT_CSS_VAR).toBe("--app-navbar-height");
    expect(APP_NAVBAR_HEIGHT_FALLBACK).toContain("3.5rem");
    expect(APP_INNER_SCROLL_STICKY_TOP_CLASS).toBe("top-0");
    expect(APP_NAVBAR_INNER_ROW_CLASS).toBe("min-h-14");
  });
});
