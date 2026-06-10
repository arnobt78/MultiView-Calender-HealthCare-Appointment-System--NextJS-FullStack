import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";

describe("ControlPanelGlassActionButton C17", () => {
  it("renders cursor-pointer and disabled cursor-not-allowed on button", () => {
    const html = renderToStaticMarkup(
      <ControlPanelGlassActionButton type="button" variant="sky">
        Save
      </ControlPanelGlassActionButton>
    );
    expect(html).toContain("cursor-pointer");
    expect(html).toContain("disabled:cursor-not-allowed");
  });
});
