import { describe, expect, it } from "vitest";
import { invoiceDetailHref } from "@/lib/entity-routes";

describe("invoiceDetailHref", () => {
  it("routes admin to control panel", () => {
    expect(invoiceDetailHref("admin", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).toBe(
      "/control-panel/invoices/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    );
  });

  it("routes doctor to portal invoice detail", () => {
    expect(invoiceDetailHref("doctor", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).toBe(
      "/invoices/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    );
  });

  it("routes patient to portal invoice detail", () => {
    expect(invoiceDetailHref("patient", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")).toBe(
      "/invoices/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    );
  });
});
