import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** C46 — portal patients layout mirrors appointments invoice shell. */
describe("portal patients layout C46", () => {
  it("patients layout exports force-dynamic and invoice prefetch shell", () => {
    const layout = readFileSync(
      resolve(process.cwd(), "src/app/patients/layout.tsx"),
      "utf8"
    );
    expect(layout).toContain('export const dynamic = "force-dynamic"');
    expect(layout).toContain("prefetchInvoices");
    expect(layout).toContain("PatientsClinicianLayoutClient");
  });

  it("PatientsClinicianLayoutClient wraps ClinicianInvoiceDialogShell", () => {
    const client = readFileSync(
      resolve(process.cwd(), "src/app/patients/PatientsClinicianLayoutClient.tsx"),
      "utf8"
    );
    expect(client).toContain("ClinicianInvoiceDialogShell");
  });

  it("portal patient page does not duplicate prefetchInvoices", () => {
    const page = readFileSync(
      resolve(process.cwd(), "src/app/patients/[id]/page.tsx"),
      "utf8"
    );
    expect(page).not.toContain("prefetchInvoices");
    expect(page).not.toContain("initialInvoices");
  });
});
