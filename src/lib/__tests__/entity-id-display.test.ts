import { describe, expect, it } from "vitest";
import { ENTITY_ID_SHORT_LENGTH, formatShortEntityId } from "@/lib/entity-id-display";

describe("entity-id-display", () => {
  it("formats short id with hash prefix", () => {
    expect(formatShortEntityId("636546d1-ceee-47dc-8185-df0793d42032")).toBe("#636546d1");
  });

  it("uses ENTITY_ID_SHORT_LENGTH chars", () => {
    expect(ENTITY_ID_SHORT_LENGTH).toBe(8);
    expect(formatShortEntityId("abcdefgh1234")).toBe("#abcdefgh");
  });

  it("returns em dash for empty id", () => {
    expect(formatShortEntityId("")).toBe("—");
    expect(formatShortEntityId("   ")).toBe("—");
  });
});
