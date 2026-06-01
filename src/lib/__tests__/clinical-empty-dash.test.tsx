import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ClinicalEmptyDash } from "@/components/shared/ClinicalTableEmptyDash";
import { CLINICAL_EMPTY_EM_DASH } from "@/lib/clinical-empty-value";

/** Entity detail rows must render one placeholder glyph (no nested duplicate spans). */
describe("ClinicalEmptyDash", () => {
  it("renders a single em-dash span for definition layout", () => {
    const html = renderToStaticMarkup(
      createElement(ClinicalEmptyDash, { layout: "definition" })
    );
    expect(html).toContain(CLINICAL_EMPTY_EM_DASH);
    expect(html.match(/<span/g)?.length ?? 0).toBe(1);
  });
});
