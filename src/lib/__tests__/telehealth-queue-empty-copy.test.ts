import { describe, it, expect } from "vitest";
import { buildTelehealthQueueEmptyCopy } from "@/lib/telehealth-queue-empty-copy";

describe("buildTelehealthQueueEmptyCopy", () => {
  it("returns today-specific copy", () => {
    const copy = buildTelehealthQueueEmptyCopy("today");
    expect(copy.title.toLowerCase()).toContain("today");
  });

  it("returns upcoming-specific copy", () => {
    const copy = buildTelehealthQueueEmptyCopy("upcoming");
    expect(copy.title.toLowerCase()).toContain("upcoming");
  });

  it("returns all-time copy", () => {
    const copy = buildTelehealthQueueEmptyCopy("all");
    expect(copy.subtitle.toLowerCase()).toMatch(/all.time|all-time/);
  });
});
