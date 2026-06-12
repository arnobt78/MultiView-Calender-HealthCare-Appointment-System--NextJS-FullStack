import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ScopeFilterInlineRow } from "@/components/shared/filters/ScopeFilterInlineRow";

describe("ScopeFilterInlineRow", () => {
  it("wraps filter controls when needed without clipping overflow", () => {
    const markup = renderToStaticMarkup(
      <ScopeFilterInlineRow>
        <span>Org</span>
        <span>Doctor</span>
        <span>Reset</span>
      </ScopeFilterInlineRow>
    );
    expect(markup).toContain("flex-wrap");
    expect(markup).not.toContain("overflow-x-auto");
  });
});
