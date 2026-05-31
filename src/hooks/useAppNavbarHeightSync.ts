"use client";

import { useLayoutEffect, type RefObject } from "react";
import { APP_NAVBAR_HEIGHT_CSS_VAR } from "@/lib/portal-z-index";

/**
 * Publishes measured fixed navbar height to `--app-navbar-height` on `<html>`.
 * AuthShell `<main>` and document-scroll sticky rows consume the same token (role-aware link count).
 */
export function useAppNavbarHeightSync(navbarRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = navbarRef.current;
    if (!el) return;

    const apply = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty(APP_NAVBAR_HEIGHT_CSS_VAR, `${height}px`);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    window.addEventListener("resize", apply);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
      document.documentElement.style.removeProperty(APP_NAVBAR_HEIGHT_CSS_VAR);
    };
  }, [navbarRef]);
}
