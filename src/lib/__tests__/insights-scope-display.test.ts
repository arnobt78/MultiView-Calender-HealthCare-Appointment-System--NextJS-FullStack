import { describe, expect, it } from "vitest";
import {
  resolveInsightsScopeChartLabel,
  resolveInsightsScopePageHint,
} from "@/lib/insights-scope-display";
import { formatInsightsChartContextSubtitle } from "@/lib/insights-chart-subtitle";

describe("resolveInsightsScopeChartLabel", () => {
  it("returns Organization-wide for org scope", () => {
    expect(
      resolveInsightsScopeChartLabel({ scope: "organization", viewerRole: "admin" })
    ).toBe("Organization-wide");
  });

  it("returns doctor name for admin drill-down", () => {
    expect(
      resolveInsightsScopeChartLabel({
        scope: "personal",
        viewerRole: "admin",
        doctorId: "uuid",
        doctorDisplayName: "Dr. Smith",
      })
    ).toBe("Dr. Smith");
  });

  it("returns My practice for doctor role", () => {
    expect(
      resolveInsightsScopeChartLabel({ scope: "personal", viewerRole: "doctor" })
    ).toBe("My practice");
  });
});

describe("formatInsightsChartContextSubtitle", () => {
  it("joins scope and period with middle dot", () => {
    expect(
      formatInsightsChartContextSubtitle({
        scopeLabel: "My practice",
        periodLabel: "This week (Sun, May 25 – Sat, May 31, 2026)",
      })
    ).toBe("My practice · This week (Sun, May 25 – Sat, May 31, 2026)");
  });
});

describe("resolveInsightsScopePageHint", () => {
  it("returns org hint", () => {
    expect(
      resolveInsightsScopePageHint({ scope: "organization", viewerRole: "admin" })
    ).toContain("organization-wide");
  });
});
