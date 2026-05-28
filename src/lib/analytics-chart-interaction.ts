/**
 * Shared Recharts interaction tokens for /insights analytics charts —
 * tooltips above glass cards, value labels on non-zero points, pie slice config.
 */

import type { ChartConfig } from "@/components/ui/chart";
import { ANALYTICS_CHART_COLORS } from "@/components/shared/analytics/analytics-chart-classes";
import type { AnalyticsChartEmptyKind } from "@/lib/analytics-chart-empty";

/** Above glass chart panels (`Z_SELECT_DROPDOWN`), below fixed navbar (`Z_NAVBAR`). */
export const ANALYTICS_CHART_TOOLTIP_Z_INDEX = 200;

/** Cartesian shell — explicit height so ResponsiveContainer never collapses to 0. */
export const analyticsChartCartesianHeightClass =
  "h-[240px] min-h-[240px] w-full min-w-0";

/** Taller plot when X-axis uses horizontal word-wrap (doctor names, categories). */
export const analyticsChartCartesianHeightWrapClass =
  "h-[280px] min-h-[280px] w-full min-w-0";

/** ResponsiveContainer class for wrap-layout inners (matches plot shell height). */
export const analyticsChartResponsiveHeightWrapClass =
  "w-full min-w-0 h-[280px]";

/**
 * Reserved band for horizontal category ticks (Recharts XAxis.height).
 * Sized for short labels (dates, weekdays) that fit on 1–2 lines.
 */
export const analyticsChartSlopedXAxisHeight = 40;

/** Taller band for horizontal word-wrapped labels (doctor names, categories) — up to 3 lines. */
export const analyticsChartSlopedXAxisWrapHeight = 40;

export type AnalyticsChartXAxisLayout = "sloped" | "wrap";

/** All insights cartesian charts use sloped ticks — horizontal wrap reads as crowded "row" labels. */
export function resolveAnalyticsChartXAxisLayout(
  _emptyKind?: AnalyticsChartEmptyKind,
  _dataKey: "label" | "month" = "label"
): AnalyticsChartXAxisLayout {
  return "sloped";
}

export function resolveAnalyticsChartPlotHeightClass(
  layout: AnalyticsChartXAxisLayout
): string {
  return layout === "wrap"
    ? analyticsChartCartesianHeightWrapClass
    : analyticsChartCartesianHeightClass;
}

/** Plot margins — top for value labels; bottom small (ticks use XAxis.height band). */
export const analyticsChartPlotMargin = {
  left: 8,
  right: 16,
  top: 36,
  bottom: 8,
} as const;

export const analyticsChartPlotMarginWrap = {
  left: 8,
  right: 16,
  top: 36,
  bottom: 8,
} as const;

export const analyticsChartPlotMarginDense = {
  ...analyticsChartPlotMargin,
  top: 36,
  bottom: 8,
} as const;

/** Cartesian charts — labels/tooltips may render outside the default viewBox. */
export const analyticsChartCartesianProps = {
  margin: analyticsChartPlotMargin,
  allowDataOverflow: true,
} as const;

export const analyticsChartCartesianPropsWrap = {
  margin: analyticsChartPlotMarginWrap,
  allowDataOverflow: true,
} as const;

export function analyticsChartCartesianPropsForLayout(layout: AnalyticsChartXAxisLayout): {
  margin: typeof analyticsChartPlotMargin | typeof analyticsChartPlotMarginWrap;
  allowDataOverflow: true;
} {
  return layout === "wrap" ? analyticsChartCartesianPropsWrap : analyticsChartCartesianProps;
}

export const analyticsChartCartesianPropsDense = {
  margin: analyticsChartPlotMarginDense,
  allowDataOverflow: true,
} as const;

/**
 * Above this data-point count, XAxis ticks stagger: even-index labels float above the axis
 * line, odd-index labels sit below — all visible, no overlap. Exported so the tick renderer
 * component uses the same threshold without duplicating the constant.
 */
export const ANALYTICS_X_AXIS_STAGGER_THRESHOLD = 10;

/**
 * Dynamic XAxis interval to prevent label overlap on dense series (day=24h, month=30d).
 * Returns 0 (show all) when data fits; otherwise skips every nth tick so ≤10 labels show.
 * Kept as a utility export; stagger approach uses interval=0 with above/below row offset.
 */
export function analyticsChartXAxisInterval(dataLength: number): number {
  if (dataLength <= ANALYTICS_X_AXIS_STAGGER_THRESHOLD) return 0;
  return Math.ceil(dataLength / ANALYTICS_X_AXIS_STAGGER_THRESHOLD) - 1;
}

/**
 * Chart margin when XAxis ticks stagger above/below the axis line.
 * Extra bottom margin creates an empty buffer zone so even-index labels that float
 * above the axis line (negative dy) render in empty space, not over chart data.
 */
export const analyticsChartPlotMarginStagger = {
  left: 8,
  right: 16,
  top: 36,
  bottom: 26,
} as const;

/**
 * Returns chart props (margin + allowDataOverflow) for the given layout and data length.
 *
 * `staggerAbove=true`  (line/area): dense series use above-below axis stagger, requires
 *   extra bottom margin so above-axis labels land in the buffer zone, not over data.
 * `staggerAbove=false` (bar/stacked-bar): both stagger rows sit below the axis so bars
 *   never cover labels — standard bottom margin is sufficient.
 */
export function analyticsChartCartesianPropsForDensity(
  layout: AnalyticsChartXAxisLayout,
  dataLength: number,
  staggerAbove = true
): {
  margin:
    | typeof analyticsChartPlotMargin
    | typeof analyticsChartPlotMarginWrap
    | typeof analyticsChartPlotMarginStagger;
  allowDataOverflow: true;
} {
  const stagger = layout !== "wrap" && dataLength > ANALYTICS_X_AXIS_STAGGER_THRESHOLD;
  if (stagger && staggerAbove) {
    return { margin: analyticsChartPlotMarginStagger, allowDataOverflow: true };
  }
  return analyticsChartCartesianPropsForLayout(layout);
}

export type AnalyticsChartXAxisDensity = "default" | "dense";

/** Horizontal wrap tick text (doctor names, categories). */
export const analyticsChartAxisTickStyle = {
  fill: "#475569",
  fontSize: 10,
  lineHeight: 12,
} as const;

/** SVG text style for LabelList — Tailwind fill classes are unreliable on Recharts <text>. */
export const analyticsChartLabelStyle = {
  fill: "#334155",
  fontSize: 11,
  fontWeight: 600,
} as const;

/** On-chart value labels — readable on glass cards (stroke improves contrast on light fills). */
export const analyticsChartLabelClass =
  "fill-slate-700 text-[10px] font-semibold [paint-order:stroke_fill] [stroke:white] [stroke-width:2px]";

/** Stacked segment labels — dark text on colored segments (avoid invisible white on amber). */
export const analyticsChartStackedLabelClass =
  "fill-slate-800 text-[9px] font-semibold drop-shadow-sm";

export type AnalyticsChartValueKind = "count" | "currency";

/** Centered empty-state overlay on insights chart plot area. */
export const analyticsChartEmptyOverlayClass =
  "pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/50 px-3 backdrop-blur-[1px] sm:px-4";

/** Empty-state copy stack — title row then description row, centered in plot. */
export const analyticsChartEmptyCopyStackClass =
  "flex w-full max-w-full flex-col items-center gap-1 text-center";

export const analyticsChartEmptyTitleClass = "text-sm font-medium text-muted-foreground";

/** Description row — full width with normal inline word breaks (not title+desc on one line). */
export const analyticsChartEmptyDescriptionClass =
  "text-xs leading-snug text-muted-foreground/90 [overflow-wrap:anywhere]";

export type AnalyticsChartTooltipCursorVariant =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "none";

/** Hover affordance per chart geometry — `none` for pie (slice highlight only). */
export function analyticsChartTooltipCursor(
  variant: AnalyticsChartTooltipCursorVariant
): boolean | { fill?: string; stroke?: string; strokeWidth?: number; strokeDasharray?: string } {
  switch (variant) {
    case "bar":
      return { fill: "rgba(15, 23, 42, 0.1)" };
    case "line":
    case "area":
      return {
        stroke: "rgba(15, 23, 42, 0.25)",
        strokeWidth: 1,
        strokeDasharray: "4 4",
      };
    case "pie":
    case "none":
    default:
      return false;
  }
}

const CATEGORY_AXIS_MAX_LINES = 3;
const CATEGORY_AXIS_MAX_CHARS_PER_LINE = 12;

/**
 * Wrap long category labels into multiple lines (word-aware) for horizontal X-axis ticks.
 */
export function wrapCategoryAxisLabel(
  text: string,
  maxCharsPerLine = CATEGORY_AXIS_MAX_CHARS_PER_LINE,
  maxLines = CATEGORY_AXIS_MAX_LINES
): string[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [""];
  }

  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  const pushLine = (line: string) => {
    if (lines.length < maxLines) {
      lines.push(line);
    }
  };

  const flush = () => {
    if (current) {
      pushLine(current);
      current = "";
    }
  };

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      continue;
    }
    flush();
    if (word.length > maxCharsPerLine) {
      let rest = word;
      while (rest.length > maxCharsPerLine && lines.length < maxLines) {
        pushLine(rest.slice(0, maxCharsPerLine));
        rest = rest.slice(maxCharsPerLine);
      }
      current = rest;
    } else {
      current = word;
    }
  }
  flush();

  if (lines.length === 0) {
    return [trimmed.slice(0, maxCharsPerLine)];
  }

  if (lines.length === maxLines) {
    const joined = lines.join("");
    const sourceLen = trimmed.replace(/\s+/g, "").length;
    if (joined.replace(/\s+/g, "").length < sourceLen) {
      const last = lines[maxLines - 1] ?? "";
      lines[maxLines - 1] =
        last.length > maxCharsPerLine - 1
          ? `${last.slice(0, maxCharsPerLine - 1)}…`
          : `${last}…`;
    }
  }

  return lines;
}

/** Tooltip series row label — ChartConfig first, then Recharts `name`, then dataKey title-case. */
export function resolveAnalyticsTooltipSeriesLabel(
  dataKey: string | number | undefined,
  name: string | number | undefined,
  config?: ChartConfig,
  fallbackName?: string | number | undefined
): string {
  const key = dataKey != null ? String(dataKey) : "";
  const nameStr = name != null ? String(name) : "";

  // Pie slices: name IS the config key (e.g. "Telehealth Session"); dataKey is shared "count".
  // Try name as config key first so slice labels win over the generic "count" entry.
  if (nameStr && nameStr !== key && config?.[nameStr] != null) {
    const fromNameKey = config[nameStr]?.label;
    if (fromNameKey != null && String(fromNameKey).trim() !== "") {
      return String(fromNameKey);
    }
    return nameStr;
  }

  const normalizedName = nameStr.trim().toLowerCase();
  const isGenericCount =
    normalizedName === "count" || (key === "count" && normalizedName === "");
  if (isGenericCount && fallbackName != null && String(fallbackName).trim() !== "") {
    return String(fallbackName);
  }
  const fromConfig = key && config?.[key]?.label;
  if (fromConfig != null && String(fromConfig).trim() !== "") {
    return String(fromConfig);
  }
  if (name != null && String(name).trim() !== "" && String(name) !== key) {
    return String(name);
  }
  if (fallbackName != null && String(fallbackName).trim() !== "") {
    return String(fallbackName);
  }
  if (!key) {
    return "Value";
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/** Bucket title for cartesian tooltip — label prop or row label/month field. */
export function resolveAnalyticsTooltipBucketLabel(
  label: string | number | undefined,
  payload: ReadonlyArray<{ payload?: { label?: string; month?: string } }> | undefined
): string | null {
  if (label != null && String(label).trim() !== "") {
    return String(label);
  }
  const row = payload?.[0]?.payload;
  const fromRow = row?.label ?? row?.month;
  return fromRow != null && String(fromRow).trim() !== "" ? String(fromRow) : null;
}

/** Omit zero/empty values from on-chart labels. */
export function formatAnalyticsChartLabelValue(value: unknown): string | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return Number.isInteger(n) ? String(n) : n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

/**
 * @deprecated Prefer `<AnalyticsChartValueLabelList dataKey="…" />` on Bar/Line/Area children.
 */
export const analyticsSeriesPointLabel = {
  position: "top" as const,
  offset: 10,
  fill: analyticsChartLabelStyle.fill,
  fontSize: analyticsChartLabelStyle.fontSize,
  fontWeight: analyticsChartLabelStyle.fontWeight,
  formatter: (value: unknown) => formatAnalyticsChartLabelValue(value) ?? "",
};

/** Tooltip value line — same rules as labels; currency for paid-revenue cents. */
export function formatAnalyticsChartTooltipValue(
  value: unknown,
  kind: AnalyticsChartValueKind = "count"
): string {
  const formatted = formatAnalyticsChartLabelValue(value);
  if (formatted == null) {
    return "0";
  }
  if (kind === "currency") {
    const n = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(n)) {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n / 100);
    }
  }
  return formatted;
}

type StackedBarRow = { done?: number; pending?: number; alert?: number };

/** Recharts LabelList passes either the row or `{ payload: row }`. */
export function normalizeStackedBarLabelEntry(entry: unknown): StackedBarRow | undefined {
  if (!entry || typeof entry !== "object") {
    return undefined;
  }
  if ("payload" in entry && entry.payload && typeof entry.payload === "object") {
    return entry.payload as StackedBarRow;
  }
  return entry as StackedBarRow;
}

/** Show label on the topmost non-zero stacked segment only — avoids overlapping numbers. */
export function formatStackedBarSegmentLabel(
  dataKey: string,
  value: unknown,
  row: StackedBarRow | undefined
): string {
  const formatted = formatAnalyticsChartLabelValue(value);
  if (formatted == null || !row) {
    return "";
  }
  const order = ["alert", "pending", "done"] as const;
  const topKey = order.find((key) => (row[key] ?? 0) > 0);
  if (topKey !== dataKey) {
    return "";
  }
  return formatted;
}

/** Total appointments in stack — label on top bar (status-over-time). */
export function formatStackedBarTotalLabel(_value: unknown, entry: unknown): string {
  const row = normalizeStackedBarLabelEntry(entry);
  if (!row) {
    return "";
  }
  const total = (row.done ?? 0) + (row.pending ?? 0) + (row.alert ?? 0);
  return formatAnalyticsChartLabelValue(total) ?? "";
}

/** Pie: connector lines only when multiple slices — avoids stray line on 100% single slice. */
export function shouldShowPieLabelLines(data: ReadonlyArray<{ count?: number }>): boolean {
  const active = data.filter((row) => (row.count ?? 0) > 0);
  return active.length > 1;
}

/** Per-slice connector — hide on dominant arcs (stray horizontal line on ~50%+ slices). */
export function shouldShowPieSliceLabelLine(percent: number): boolean {
  const p = Number.isFinite(percent) ? percent : 0;
  return p > 0.04 && p < 0.45;
}

type PieSlice = { name: string };

/**
 * Pie tooltips resolve labels via slice `name` (not a single `count` config key).
 * Also seeds --color-{name} CSS vars for ChartStyle when slices are stable.
 */
export function buildPieChartConfigFromSlices(slices: readonly PieSlice[]): ChartConfig {
  const config: ChartConfig = {
    count: { label: "Count", color: ANALYTICS_CHART_COLORS[0] },
  };
  slices.forEach((slice, index) => {
    const key = slice.name.trim() || `slice-${index}`;
    config[key] = {
      label: slice.name,
      color: ANALYTICS_CHART_COLORS[index % ANALYTICS_CHART_COLORS.length],
    };
  });
  return config;
}
