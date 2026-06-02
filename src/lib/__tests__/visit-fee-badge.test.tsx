import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { VisitFeeBadge } from "@/components/shared/billing/VisitFeeBadge";

describe("VisitFeeBadge", () => {
  it("renders nothing when price is zero", () => {
    const html = renderToStaticMarkup(createElement(VisitFeeBadge, { priceCents: 0 }));
    expect(html).toBe("");
  });

  it("renders de-DE amount without a second currency suffix", () => {
    const html = renderToStaticMarkup(createElement(VisitFeeBadge, { priceCents: 9250 }));
    expect(html).toContain("92,50");
    expect(html).not.toMatch(/92,50\s*€/);
    expect(html).not.toContain("€&nbsp;92");
  });
});
