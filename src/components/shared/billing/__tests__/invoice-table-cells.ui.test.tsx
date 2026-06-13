import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  InvoiceAmountStatusTableCell,
  InvoiceManagementIdentityCell,
} from "@/components/shared/billing/invoice-table-cells";
import type { Invoice } from "@/hooks/usePayments";

vi.mock("@/components/shared/EntityTitleLink", () => ({
  EntityTitleLink: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("@/components/shared/EntityIdCopyInline", () => ({
  EntityIdCopyInline: ({
    displayValue,
    labelNode,
  }: {
    displayValue?: string;
    labelNode?: React.ReactNode;
  }) => <span>{labelNode ?? displayValue}</span>,
}));

const sampleInvoice: Invoice = {
  id: "168da90a-1234-5678-9abc-def012345678",
  user_id: "user-1",
  amount: 12000,
  currency: "eur",
  status: "sent",
  created_at: "2026-06-08T13:14:00.000Z",
  payments: [],
};

describe("InvoiceAmountStatusTableCell", () => {
  it("stacks amount and status badge vertically", () => {
    const markup = renderToStaticMarkup(
      <InvoiceAmountStatusTableCell invoice={sampleInvoice} />
    );
    expect(markup).toContain("flex-col");
    expect(markup).toContain("120");
  });
});

describe("InvoiceManagementIdentityCell", () => {
  it("merges single clickable identity line, amount, and status badge", () => {
    const markup = renderToStaticMarkup(
      <InvoiceManagementIdentityCell
        invoice={sampleInvoice}
        viewerRole="admin"
        listIndex={2}
      />
    );
    expect(markup).toContain("Invoice 2: #168da90a");
    expect(markup).toContain("120");
  });
});
