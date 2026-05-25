/** Collapse a native `<details>` without React open state (hydration-safe). */
export function closeHtmlDetails(element: HTMLDetailsElement | null | undefined): void {
  element?.removeAttribute("open");
}
