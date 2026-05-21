import { describe, expect, it } from "vitest";
import {
  bucketDateGroupsByListSection,
  dayDiffFromToday,
  groupRowsByStartDate,
  listSectionsForPortalFilter,
} from "@/lib/appointment-list-sections";

describe("appointment-list-sections", () => {
  it("dayDiffFromToday returns 0 for today midnight", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(dayDiffFromToday(today)).toBe(0);
  });

  it("buckets rows into today and later", () => {
    const today = new Date();
    today.setHours(10, 0, 0, 0);
    const later = new Date(today);
    later.setDate(later.getDate() + 3);
    const grouped = groupRowsByStartDate([
      { start: today.toISOString() },
      { start: later.toISOString() },
    ]);
    const buckets = bucketDateGroupsByListSection(grouped);
    expect(buckets.today).toHaveLength(1);
    expect(buckets.later).toHaveLength(1);
    expect(buckets.today[0]?.items).toHaveLength(1);
  });

  it("listSectionsForPortalFilter scopes tabs", () => {
    expect(listSectionsForPortalFilter("past")).toEqual(["passed"]);
    expect(listSectionsForPortalFilter("upcoming")).toEqual(["today", "tomorrow", "later"]);
    expect(listSectionsForPortalFilter("all")).toHaveLength(4);
  });
});
