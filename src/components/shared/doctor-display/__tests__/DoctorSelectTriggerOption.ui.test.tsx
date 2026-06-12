import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DoctorSelectTriggerOption } from "@/components/shared/doctor-display/DoctorSelectTriggerOption";

describe("DoctorSelectTriggerOption", () => {
  it("renders name and specialty inline beside avatar for fixed h-10 triggers", () => {
    const markup = renderToStaticMarkup(
      <DoctorSelectTriggerOption
        doctor={{
          id: "d1",
          email: "doc@test.com",
          display_name: "Demo Doctor",
          specialty: "Medicine",
        }}
      />
    );
    expect(markup).toContain("Demo Doctor");
    expect(markup).toContain("Medicine");
    expect(markup).not.toContain("flex-col");
    expect(markup).toContain("items-center");
  });
});
