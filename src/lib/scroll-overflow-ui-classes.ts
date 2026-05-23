/**
 * Shared scroll-overflow affordances — CP sidebar, booking pickers, Radix select scroll rows.
 */
import { cn } from "@/lib/utils";

/** Circular chevron control (CP sidebar + select scroll buttons). */
export const scrollOverflowChevronButtonClass = cn(
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white shadow-md",
  "ring-1 ring-gray-200/80 text-gray-400 transition-colors",
  "hover:text-sky-600 hover:ring-sky-300 cursor-pointer"
);

/** Top fade — `gradientFrom` tailwind token e.g. `from-white/90` or `from-white`. */
export function scrollOverflowTopGradientClass(gradientFrom = "from-white/90") {
  return cn("h-8 w-full bg-gradient-to-b", gradientFrom, "via-white/50 to-transparent");
}

/** Bottom fade before down chevron. */
export function scrollOverflowBottomGradientClass(gradientFrom = "from-white/90") {
  return cn("h-10 w-full bg-gradient-to-t", gradientFrom, "via-white/60 to-transparent");
}

/** Overlay wrapper — absolute top/bottom indicators over a relatively positioned scroller. */
export const scrollOverflowOverlayLayerClass =
  "pointer-events-none absolute inset-x-0 z-10 flex flex-col items-center";

export const scrollOverflowOverlayTopClass = cn(
  scrollOverflowOverlayLayerClass,
  "top-0"
);

export const scrollOverflowOverlayBottomClass = cn(
  scrollOverflowOverlayLayerClass,
  "bottom-0"
);

/** Radix select scroll row — centers circular chevron in the scroll button slot. */
export const selectScrollOverflowButtonRowClass =
  "flex h-8 w-full cursor-pointer items-center justify-center py-0";
