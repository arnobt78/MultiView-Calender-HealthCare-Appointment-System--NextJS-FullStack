/**
 * Scroll a node into view inside the booking dialog (or any overflow parent).
 * Respects `prefers-reduced-motion`.
 */

export function smoothScrollIntoView(
  element: HTMLElement | null,
  options?: { block?: ScrollLogicalPosition }
): void {
  if (!element) return;
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: options?.block ?? "start",
  });
}

/** Double rAF — run after layout when conditional UI (e.g. slots panel) mounts. */
export function smoothScrollIntoViewAfterLayout(
  element: HTMLElement | null,
  options?: { block?: ScrollLogicalPosition }
): void {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => smoothScrollIntoView(element, options));
  });
}
