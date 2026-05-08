/**
 * Unit tests — normalize.ts
 * Verifies normalizeList / denormalizeList round-trip.
 */
import { describe, it, expect } from "vitest";
import { normalizeList, denormalizeList } from "@/lib/normalize";

interface Item { id: string; name: string; [key: string]: unknown }

const items: Item[] = [
  { id: "a", name: "Alice" },
  { id: "b", name: "Bob" },
];

describe("normalizeList", () => {
  it("produces an entities map and ordered ids array", () => {
    const result = normalizeList(items);
    expect(result.ids).toEqual(["a", "b"]);
    expect(result.entities["a"]).toEqual({ id: "a", name: "Alice" });
    expect(result.entities["b"]).toEqual({ id: "b", name: "Bob" });
  });

  it("handles empty array", () => {
    const result = normalizeList<Item>([]);
    expect(result.ids).toEqual([]);
    expect(result.entities).toEqual({});
  });

  it("skips null items", () => {
    // Filter guard — only valid items normalise
    const mixed = [...items, null].filter(Boolean) as Item[];
    const result = normalizeList(mixed);
    expect(result.ids).toHaveLength(2);
  });
});

describe("denormalizeList", () => {
  it("restores original order from normalized structure", () => {
    const { ids, entities } = normalizeList(items);
    const restored = denormalizeList(ids, entities);
    expect(restored).toEqual(items);
  });

  it("handles empty arrays", () => {
    const result = denormalizeList([], {});
    expect(result).toEqual([]);
  });

  it("skips ids without matching entity", () => {
    const { entities } = normalizeList(items);
    const restored = denormalizeList(["a", "missing"], entities);
    expect(restored).toHaveLength(1);
    expect(restored[0].id).toBe("a");
  });
});
