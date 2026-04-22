"use client";

import { useEffect, useState } from "react";

/**
 * Responsive logic for conditional rendering, data loading and accessibility.
 *
 * SSR-safe: starts as `false` so server markup matches first client render, then
 * updates to the real `matchMedia` result after mount. Subscribes to changes via
 * `MediaQueryList.addEventListener`.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia(query);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional SSR hydration: sync to real match on mount
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Named breakpoints — use instead of repeating magic strings.
 *
 *   const isMobile = useMediaQuery(breakpoints.mobile);
 *   const prefersDark = useMediaQuery(breakpoints.darkMode);
 */
export const breakpoints = {
  mobile: "(max-width: 768px)",
  tablet: "(min-width: 769px) and (max-width: 1024px)",
  desktop: "(min-width: 1025px)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
  darkMode: "(prefers-color-scheme: dark)",
} as const;
