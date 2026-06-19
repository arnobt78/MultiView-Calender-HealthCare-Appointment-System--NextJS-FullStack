import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InvoiceDeletionActorMeta } from "@/components/shared/billing/InvoiceDeletionActorMeta";

describe("InvoiceDeletionActorMeta", () => {
  it("renders visit deleted stamp with linked actor", () => {
    const html = renderToStaticMarkup(
      <InvoiceDeletionActorMeta
        kind="visit"
        at="2026-06-19T14:30:00.000Z"
        actor={{
          userId: "admin-1",
          label: "Demo Admin",
          email: "admin@example.com",
          image: null,
          role: "admin",
        }}
        viewerRole="doctor"
      />
    );
    expect(html).toContain("Visit deleted:");
    expect(html).toContain("Demo Admin");
  });

  it("renders compact invoice deleted stamp without actor", () => {
    const html = renderToStaticMarkup(
      <InvoiceDeletionActorMeta
        kind="invoice"
        at="2026-06-19T14:30:00.000Z"
        layout="compact"
      />
    );
    expect(html).toContain("Invoice deleted");
  });
});
