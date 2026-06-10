import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ControlPanelHeaderSubtitle } from "@/components/control-panel/ControlPanelHeaderSubtitle";

describe("ControlPanelHeaderSubtitle C12.2", () => {
  it("always renders static lead", () => {
    const html = renderToStaticMarkup(
      <ControlPanelHeaderSubtitle lead="Real-time system summary — last updated" />
    );
    expect(html).toContain("Real-time system summary — last updated");
  });

  it("renders inline skeleton when metricLoading", () => {
    const html = renderToStaticMarkup(
      <ControlPanelHeaderSubtitle
        lead="Review in-app notifications — last updated"
        metricLoading
      />
    );
    expect(html).toContain("Review in-app notifications — last updated");
    expect(html).toContain("animate-pulse");
  });

  it("renders metric and suffix when warm", () => {
    const html = renderToStaticMarkup(
      <ControlPanelHeaderSubtitle
        lead="Admin account —"
        metric="12"
        metricSuffix=" appointments"
      />
    );
    expect(html).toContain("Admin account —");
    expect(html).toContain("12 appointments");
  });

  it("reserves metric slot with skeleton when showMetricSlot and no metric", () => {
    const html = renderToStaticMarkup(
      <ControlPanelHeaderSubtitle lead="Lead —" showMetricSlot metricLoading />
    );
    expect(html).toContain("animate-pulse");
  });
});
