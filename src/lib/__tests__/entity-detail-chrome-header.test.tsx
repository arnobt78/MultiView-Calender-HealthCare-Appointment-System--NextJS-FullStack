import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { User } from "lucide-react";

describe("EntityDetailChromeHeader C14", () => {
  it("omits border-b on entity detail header shell", () => {
    const html = renderToStaticMarkup(
      <EntityDetailChromeHeader icon={User} title="Test Entity" description="Detail" />
    );
    expect(html).not.toMatch(/border-b/);
  });
});
