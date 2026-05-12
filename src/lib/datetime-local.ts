/**
 * Bridges `<input type="datetime-local">` values with UTC ISO strings used by APIs.
 * Kept in one module so booking pickers and `AppointmentDialog` stay in sync.
 */

/** Convert UTC ISO string to `YYYY-MM-DDTHH:mm` in the browser's local timezone. */
export function utcToLocalInputValue(utcString: string): string {
  if (!utcString) return "";
  const date = new Date(utcString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

/** Convert local `YYYY-MM-DDTHH:mm` to UTC ISO string. */
export function localInputValueToUTC(localValue: string): string {
  if (!localValue) return "";
  return new Date(localValue).toISOString();
}
