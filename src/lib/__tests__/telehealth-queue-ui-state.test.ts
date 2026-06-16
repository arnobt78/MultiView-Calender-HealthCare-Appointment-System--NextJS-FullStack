import { describe, expect, it } from "vitest";
import {
  buildTelehealthQueueFilterSearchParams,
  parseTelehealthQueueDateFilter,
  TELEHEALTH_QUEUE_FILTER_PARAM,
} from "@/lib/telehealth-queue-ui-state";

describe("parseTelehealthQueueDateFilter", () => {
  it("defaults to today when param missing or invalid", () => {
    expect(parseTelehealthQueueDateFilter(null)).toBe("today");
    expect(parseTelehealthQueueDateFilter(undefined)).toBe("today");
    expect(parseTelehealthQueueDateFilter("bogus")).toBe("today");
  });

  it("parses valid filter values", () => {
    expect(parseTelehealthQueueDateFilter("upcoming")).toBe("upcoming");
    expect(parseTelehealthQueueDateFilter("all")).toBe("all");
    expect(parseTelehealthQueueDateFilter("today")).toBe("today");
  });
});

describe("buildTelehealthQueueFilterSearchParams", () => {
  it("sets filter param for non-default tabs", () => {
    const params = new URLSearchParams();
    const qs = buildTelehealthQueueFilterSearchParams(params, "all");
    expect(qs).toBe(`${TELEHEALTH_QUEUE_FILTER_PARAM}=all`);
  });

  it("removes filter param when switching back to today", () => {
    const params = new URLSearchParams(`${TELEHEALTH_QUEUE_FILTER_PARAM}=upcoming`);
    const qs = buildTelehealthQueueFilterSearchParams(params, "today");
    expect(qs).toBe("");
  });
});
