import { describe, expect, it } from "vitest";
import {
  emeraldGlassBackButtonClass,
  emeraldGlassPrimaryButtonClass,
  skyGlassBackButtonClass,
  skyGlassPrimaryButtonClass,
  violetGlassBackButtonClass,
  violetGlassPrimaryButtonClass,
} from "@/lib/calendar-header-action-styles";

const GLASS_TOKENS = [
  emeraldGlassPrimaryButtonClass,
  skyGlassPrimaryButtonClass,
  skyGlassBackButtonClass,
  emeraldGlassBackButtonClass,
  violetGlassPrimaryButtonClass,
  violetGlassBackButtonClass,
];

describe("calendar-header-action-styles C17 cursor", () => {
  it.each(GLASS_TOKENS)("glass token includes cursor-pointer (%s…)", (token) => {
    expect(token).toContain("cursor-pointer");
  });
});
