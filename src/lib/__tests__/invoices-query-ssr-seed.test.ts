import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { seedInvoicesListCacheFromSsr } from "@/lib/invoices-query-ssr-seed";
import { queryKeys } from "@/lib/query-keys";

describe("seedInvoicesListCacheFromSsr", () => {
  it("seeds once and skips null", () => {
    const qc = new QueryClient();
    seedInvoicesListCacheFromSsr(qc, [{ id: "inv-1" } as never]);
    expect(qc.getQueryData(queryKeys.invoices.all)).toHaveLength(1);
    seedInvoicesListCacheFromSsr(qc, [{ id: "inv-2" } as never]);
    expect(qc.getQueryData(queryKeys.invoices.all)).toHaveLength(1);
    seedInvoicesListCacheFromSsr(qc, null);
    expect(qc.getQueryData(queryKeys.invoices.all)).toHaveLength(1);
  });
});
