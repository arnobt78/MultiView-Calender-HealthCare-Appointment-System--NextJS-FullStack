/** English weekday/month names for dashboard calendar list + month panel headers. */
export const CALENDAR_UI_LOCALE = "en-US";

export function formatCalendarListDayHeadline(date: Date): string {
  return new Intl.DateTimeFormat(CALENDAR_UI_LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatCalendarMonthFilterLabel(year: number, month1to12: number): string {
  return new Intl.DateTimeFormat(CALENDAR_UI_LOCALE, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month1to12 - 1, 1));
}

/** Month dropdown options from appointment `start` values — newest first. */
export function buildCalendarMonthFilterOptions(
  appointmentStarts: Iterable<string | Date>
): { value: string; label: string }[] {
  const all = new Set<string>();
  for (const raw of appointmentStarts) {
    const d = raw instanceof Date ? raw : new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    all.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return Array.from(all)
    .sort((a, b) => b.localeCompare(a))
    .map((value) => {
      const [year, monthPart] = value.split("-");
      return {
        value,
        label: formatCalendarMonthFilterLabel(Number(year), Number(monthPart)),
      };
    });
}
