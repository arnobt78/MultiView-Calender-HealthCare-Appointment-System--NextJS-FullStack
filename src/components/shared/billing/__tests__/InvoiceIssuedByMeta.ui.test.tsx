import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InvoiceIssuedByMeta } from "@/components/shared/billing/InvoiceIssuedByMeta";

vi.mock("@/components/shared/entity-detail/EntityDetailAuditActorInline", () => ({
  EntityDetailAuditActorInline: ({ actor }: { actor: { label: string; role?: string | null } }) => (
    <span data-testid="audit-actor">
      {actor.label}
      {actor.role ? ` · ${actor.role}` : ""}
    </span>
  ),
}));

describe("InvoiceIssuedByMeta", () => {
  it("wrapInline renders issued stamp and actor with role on one wrap row", () => {
    const markup = renderToStaticMarkup(
      <InvoiceIssuedByMeta
        createdAt="2026-06-08T10:00:00.000Z"
        issuerLabel="Demo Doctor"
        issuerImage={null}
        issuerEmail="doc@test.com"
        issuerUserId="user-1"
        issuerRole="doctor"
        viewerRole="patient"
        layout="wrapInline"
      />
    );
    expect(markup).toContain("Invoice issued");
    expect(markup).toContain('data-testid="audit-actor"');
    expect(markup).toContain("doctor");
    expect(markup).toContain("flex-wrap items-center");
  });
});
