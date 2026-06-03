import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogClose: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/shared/billing/invoice-dialog/InvoiceDialogFieldsSection", () => ({
  InvoiceDialogFieldsSection: () => <div data-testid="fields" />,
}));

vi.mock("@/components/shared/billing/invoice-dialog/InvoiceDialogVisitSection", () => ({
  InvoiceDialogVisitSection: ({ appointmentId }: { appointmentId?: string }) => (
    <div data-testid={appointmentId ? "preset-visit" : "picker-visit"} />
  ),
}));

vi.mock("@/lib/invoice-dialog-ui-classes", () => ({
  invoiceDialogShellClass: "shell",
  invoiceDialogGlassBackButtonClass: "back",
}));

vi.mock("@/lib/calendar-header-action-styles", () => ({
  amberGlassPrimaryButtonClass: "primary",
}));

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return { ...actual, toTitleCaseLabel: (s: string) => s };
});

import { InvoiceFormDialog } from "@/components/shared/billing/invoice-dialog/InvoiceFormDialog";

describe("InvoiceFormDialog UI smoke", () => {
  it("renders create mode with picker visit section", () => {
    const html = renderToStaticMarkup(
      <InvoiceFormDialog
        open
        onOpenChange={() => {}}
        mode="create"
        variant="admin"
        formSession={1}
      />
    );
    expect(html).toContain("Create Invoice");
    expect(html).toContain('data-testid="picker-visit"');
  });

  it("renders edit mode title", () => {
    const html = renderToStaticMarkup(
      <InvoiceFormDialog
        open
        onOpenChange={() => {}}
        mode="edit"
        variant="doctor"
        formSession={2}
        editInvoice={{
          id: "inv-1",
          amount: 5000,
          currency: "eur",
          description: "Consult",
        }}
      />
    );
    expect(html).toContain("Edit Invoice");
  });

  it("renders preset visit section when appointmentId set", () => {
    const html = renderToStaticMarkup(
      <InvoiceFormDialog
        open
        onOpenChange={() => {}}
        mode="create"
        variant="admin"
        formSession={3}
        appointmentId="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
      />
    );
    expect(html).toContain('data-testid="preset-visit"');
  });
});
