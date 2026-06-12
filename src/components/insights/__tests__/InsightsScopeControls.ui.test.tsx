import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InsightsScopeControls } from "@/components/insights/InsightsScopeControls";

vi.mock("@/components/insights/InsightsDoctorScopeSelect", () => ({
  InsightsDoctorScopeSelect: () => <div data-testid="insights-doctor-scope-select" />,
}));

describe("InsightsScopeControls", () => {
  it("renders doctor glass segment pills", () => {
    const markup = renderToStaticMarkup(
      <InsightsScopeControls
        filter={{ scope: "personal" }}
        onFilterChange={() => {}}
        viewerRole="doctor"
      />
    );
    expect(markup).toContain("My Practice");
    expect(markup).toContain("Organization-Wide");
    expect(markup).toContain("rounded-full");
  });

  it("renders admin org pill and doctor scope select", () => {
    const markup = renderToStaticMarkup(
      <InsightsScopeControls
        filter={{ scope: "organization" }}
        onFilterChange={() => {}}
        viewerRole="admin"
        doctors={[
          {
            id: "d1",
            email: "doc@test.com",
            display_name: "Demo Doctor",
            role: "doctor",
            specialty: "Medicine",
          },
        ]}
      />
    );
    expect(markup).toContain("Organization-Wide");
    expect(markup).toContain("By Doctor");
    expect(markup).toContain('data-testid="insights-doctor-scope-select"');
  });

  it("shows inline reset when admin drills into a doctor", () => {
    const markup = renderToStaticMarkup(
      <InsightsScopeControls
        filter={{ scope: "personal", doctorId: "d1" }}
        onFilterChange={() => {}}
        viewerRole="admin"
        doctors={[
          {
            id: "d1",
            email: "doc@test.com",
            display_name: "Demo Doctor",
            role: "doctor",
            specialty: "Medicine",
          },
        ]}
      />
    );
    expect(markup).toContain("Reset");
    expect(markup).toContain("flex-wrap");
  });
});
