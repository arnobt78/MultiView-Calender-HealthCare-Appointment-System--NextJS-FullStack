/**
 * Dashboard list + patient portal history — shared Today / Tomorrow / Passed / Later buckets.
 * Pure date math (no React) so SSR and client grouping stay identical.
 */

export type AppointmentListSectionKey = "today" | "tomorrow" | "passed" | "later";

export type StartDatedRow = { start: string };

export type DateGroupedRows<T extends StartDatedRow> = {
  date: Date;
  items: T[];
};

export type SectionBucketedRows<T extends StartDatedRow> = Record<
  AppointmentListSectionKey,
  DateGroupedRows<T>[]
>;

/** Midnight-normalized day offset from local today (0 = today, 1 = tomorrow, -1 = yesterday). */
export function dayDiffFromToday(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Group rows by calendar day ascending; each group's `date` is local midnight. */
export function groupRowsByStartDate<T extends StartDatedRow>(
  rows: T[]
): DateGroupedRows<T>[] {
  const groups: Record<string, T[]> = {};
  for (const row of rows) {
    const d = new Date(row.start);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }
  return Object.keys(groups)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((key) => ({ date: new Date(key), items: groups[key]! }));
}

/** Move today's day-group to the front when present (dashboard list parity). */
export function prioritizeTodayGroup<T extends StartDatedRow>(
  grouped: DateGroupedRows<T>[]
): DateGroupedRows<T>[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayIdx = grouped.findIndex((g) => {
    const d = new Date(g.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === now.getTime();
  });
  if (todayIdx <= 0) return grouped;
  const copy = [...grouped];
  const [todayGroup] = copy.splice(todayIdx, 1);
  return [todayGroup!, ...copy];
}

/** Split date-groups into dashboard section buckets. */
export function bucketDateGroupsByListSection<T extends StartDatedRow>(
  grouped: DateGroupedRows<T>[]
): SectionBucketedRows<T> {
  const buckets: SectionBucketedRows<T> = {
    today: [],
    tomorrow: [],
    passed: [],
    later: [],
  };
  for (const group of grouped) {
    const diff = dayDiffFromToday(group.date);
    if (diff === 0) buckets.today.push(group);
    else if (diff === 1) buckets.tomorrow.push(group);
    else if (diff < 0) buckets.passed.push(group);
    else buckets.later.push(group);
  }
  return buckets;
}

/** Portal history filter tabs → which section headers to render. */
export function listSectionsForPortalFilter(
  filter: "all" | "upcoming" | "past"
): AppointmentListSectionKey[] {
  if (filter === "past") return ["passed"];
  if (filter === "upcoming") return ["today", "tomorrow", "later"];
  return ["today", "tomorrow", "passed", "later"];
}

export type AppointmentListSectionUiConfig = {
  key: AppointmentListSectionKey;
  title: string;
  subtitle: string;
  headerClass: string;
  iconClass: string;
  countClass: string;
  emptyMessage: string;
};

/** Glass section chrome — emerald / blue / slate / violet (matches AppointmentList). */
export const APPOINTMENT_LIST_SECTION_UI: AppointmentListSectionUiConfig[] = [
  {
    key: "today",
    title: "Today's Appointments",
    subtitle: "Scheduled for today",
    headerClass:
      "border-emerald-300/55 bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-emerald-100/70",
    iconClass: "border-emerald-200 bg-emerald-100 text-emerald-700",
    countClass: "bg-emerald-100 text-emerald-700",
    emptyMessage: "No appointments for today.",
  },
  {
    key: "tomorrow",
    title: "Tomorrow",
    subtitle: "Upcoming appointments for Tomorrow",
    headerClass:
      "border-blue-300/55 bg-gradient-to-r from-blue-50 via-blue-50/80 to-sky-100/70",
    iconClass: "border-blue-200 bg-blue-100 text-blue-700",
    countClass: "bg-blue-100 text-blue-700",
    emptyMessage: "No appointments planned for tomorrow.",
  },
  {
    key: "passed",
    title: "Passed Days",
    subtitle: "Previous appointments · Auto-deleted on the 1st of each month",
    headerClass:
      "border-gray-300/55 bg-gradient-to-r from-gray-50 via-gray-50/80 to-slate-100/70",
    iconClass: "border-gray-200 bg-gray-100 text-gray-700",
    countClass: "bg-gray-200 text-gray-700",
    emptyMessage: "No passed appointments.",
  },
  {
    key: "later",
    title: "Later",
    subtitle: "Future appointments after tomorrow",
    headerClass:
      "border-violet-300/55 bg-gradient-to-r from-violet-50 via-violet-50/80 to-violet-100/70",
    iconClass: "border-violet-200 bg-violet-100 text-violet-700",
    countClass: "bg-violet-100 text-violet-700",
    emptyMessage: "No later appointments.",
  },
];

export function appointmentListSectionConfig(
  key: AppointmentListSectionKey
): AppointmentListSectionUiConfig {
  const found = APPOINTMENT_LIST_SECTION_UI.find((s) => s.key === key);
  if (!found) {
    return APPOINTMENT_LIST_SECTION_UI[0]!;
  }
  return found;
}
