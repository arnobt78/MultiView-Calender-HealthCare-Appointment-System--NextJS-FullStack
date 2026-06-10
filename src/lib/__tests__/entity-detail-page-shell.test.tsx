import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { User } from "lucide-react";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { EntityDetailPageShell } from "@/components/shared/entity-detail/EntityDetailPageShell";

describe("EntityDetailPageShell C15", () => {
  it("renders header outside body stack div", () => {
    const html = renderToStaticMarkup(
      <EntityDetailPageShell
        shell="control-panel"
        header={
          <EntityDetailChromeHeader icon={User} title="Test Entity" description="Detail" />
        }
      >
        <p>Body content</p>
      </EntityDetailPageShell>
    );
    const headerIdx = html.indexOf("Test Entity");
    const bodyStackIdx = html.indexOf("space-y-3");
    const bodyContentIdx = html.indexOf("Body content");
    expect(headerIdx).toBeGreaterThan(-1);
    expect(bodyStackIdx).toBeGreaterThan(headerIdx);
    expect(bodyContentIdx).toBeGreaterThan(bodyStackIdx);
  });
});
