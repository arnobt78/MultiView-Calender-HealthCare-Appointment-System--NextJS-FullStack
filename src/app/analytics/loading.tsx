/**
 * Analytics route loading boundary — returns null intentionally.
 *
 * AnalyticsPage (src/components/pages/AnalyticsPage.tsx) uses the inline skeleton
 * pattern: all static chrome (cards, titles, filters, buttons) stays mounted, only
 * the server-data slots (stat values, chart bars, table rows) pulse while loading.
 *
 * A full-page loading.tsx would flash a replacement skeleton BEFORE the component
 * mounts, then instantly replace it with the inline skeleton — causing a visible
 * double-flash and layout shift. Returning null avoids this entirely; the inline
 * skeleton handles all perceived loading states without flicker.
 *
 * Same approach used by src/app/control-panel/loading.tsx.
 */
export default function AnalyticsLoading() {
  return null;
}
