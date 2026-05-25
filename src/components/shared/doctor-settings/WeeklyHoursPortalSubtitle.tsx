"use client";

import { toTitleCaseLabel } from "@/lib/utils";

type Props = {
  timezone: string | null;
};

/** Weekly hours subsection line — IANA zone emphasized with `font-medium`. */
export function WeeklyHoursPortalSubtitle({ timezone }: Props) {
  const tz = timezone?.trim() || "Your Clinic Timezone";
  return (
    <>
      {toTitleCaseLabel("When patients can book you online")} ·{" "}
      {toTitleCaseLabel("All times in")}{" "}
      <span className="font-medium text-gray-700">{tz}</span>
    </>
  );
}
