import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OrganizationMembersRoleBadges } from "@/components/shared/OrganizationMembersRoleBadges";

describe("OrganizationMembersRoleBadges", () => {
  it("renders role count chips and portal-member helper", () => {
    const html = renderToStaticMarkup(
      <OrganizationMembersRoleBadges
        membersByRole={{ admin: 1, doctor: 8, patient: 1 }}
      />
    );
    expect(html).toContain("1 Admin");
    expect(html).toContain("8 Dr");
    expect(html).toContain("1 Pt");
    expect(html).toContain("Portal patient members — not clinical roster count");
  });
});
