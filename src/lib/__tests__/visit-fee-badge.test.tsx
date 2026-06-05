import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { VisitFeeBadge } from "@/components/shared/billing/VisitFeeBadge";

describe("VisitFeeBadge", () => {
  it("renders nothing when price is zero", () => {
    const html = renderToStaticMarkup(createElement(VisitFeeBadge, { priceCents: 0 }));
    expect(html).toBe("");
  });

  it("cardMeta uses span (pairs with AppointmentTypeGlassBadge height)", () => {
    const html = renderToStaticMarkup(
      createElement(VisitFeeBadge, { priceCents: 15000, size: "cardMeta" })
    );
    expect(html).toContain("<span");
    expect(html).not.toContain('data-slot="badge"');
    expect(html).toContain("py-0.5");
  });

  it("renders de-DE amount without a second currency suffix", () => {
    const html = renderToStaticMarkup(createElement(VisitFeeBadge, { priceCents: 9250 }));
    expect(html).toContain("92,50");
    expect(html).not.toMatch(/92,50\s*€/);
    expect(html).not.toContain("€&nbsp;92");
    expect(html).not.toContain("€92");
  });

  it("appends estimate hint when fee is doctor/default fallback", () => {
    const html = renderToStaticMarkup(
      createElement(VisitFeeBadge, { priceCents: 15000, showEstimateHint: true })
    );
    expect(html).toContain("· est.");
    expect(html).toContain("150,00");
  });
});
