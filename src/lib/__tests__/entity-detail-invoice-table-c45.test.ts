import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** C45 — entity detail pages use shared CP invoice table. */
describe("entity detail invoice table C45", () => {
  it("appointment detail uses InvoiceClinicalListTable", () => {
    const src = readFileSync(
      resolve(
        process.cwd(),
        "src/components/shared/appointment-detail/AppointmentDetailScreenShared.tsx"
      ),
      "utf8"
    );
    expect(src).toContain("InvoiceClinicalListTable");
    expect(src).toContain("filterInvoicesForAppointment");
    expect(src).not.toContain("buildAppointmentLinkedInvoiceColumns");
  });

  it("patient detail uses InvoiceClinicalListTable and usePayments filter", () => {
    const src = readFileSync(
      resolve(process.cwd(), "src/components/control-panel/PatientDetailScreen.tsx"),
      "utf8"
    );
    expect(src).toContain("InvoiceClinicalListTable");
    expect(src).toContain("filterInvoicesForPatient");
    expect(src).not.toContain("buildPatientInvoicesColumns");
  });
});
