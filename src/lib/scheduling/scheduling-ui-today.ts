/**
 * Browser-local calendar date for scheduling UI (yyyy-MM-dd).
 * Must match react-day-picker / date-fns local dates — not UTC from toISOString().
 */
import { format } from "date-fns";

export function getSchedulingUiToday(): string {
  return format(new Date(), "yyyy-MM-dd");
}
