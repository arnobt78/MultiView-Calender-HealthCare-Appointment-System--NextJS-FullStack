import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EntityEmailVerificationBadge } from "@/components/shared/entity-display/EntityEmailVerificationBadge";
import { cpEntityListTableFrameClass } from "@/lib/cp-entity-list-shell-classes";
import { violetGlassTableFrameClass } from "@/lib/violet-glass-table-frame";

describe("EntityEmailVerificationBadge C16", () => {
  it("renders verified label with icon and text-xs rhythm", () => {
    const html = renderToStaticMarkup(<EntityEmailVerificationBadge verified />);
    expect(html).toContain("Verified");
    expect(html).toContain("text-xs");
  });

  it("renders unverified label", () => {
    const html = renderToStaticMarkup(<EntityEmailVerificationBadge verified={false} />);
    expect(html).toContain("Unverified");
  });
});

describe("violetGlassTableFrameClass C16", () => {
  it("wires violet tone on cp entity list shell map", () => {
    expect(cpEntityListTableFrameClass.violet).toBe(violetGlassTableFrameClass);
    expect(violetGlassTableFrameClass).toContain("rgba(139,92,246");
  });
});
