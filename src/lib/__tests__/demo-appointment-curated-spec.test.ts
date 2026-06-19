import { describe, expect, it } from "vitest";
import {
  DEMO_CURATED_ADMIN_EMAIL,
  DEMO_CURATED_PRIMARY_DOCTOR_EMAIL,
  DEMO_CURATED_PRIMARY_PATIENT_EMAIL,
  DEMO_CURATED_ROWS,
  DEMO_CURATED_SEED_MARKER,
  resolveCuratedSlot,
} from "../../../scripts/lib/demo-appointment-curated-spec";

describe("demo-appointment-curated-spec", () => {
  it("defines exactly 10 curated v3 rows", () => {
    expect(DEMO_CURATED_ROWS).toHaveLength(10);
  });

  it("uses v3 seed marker in row slugs via seed module notes", () => {
    expect(DEMO_CURATED_SEED_MARKER).toBe("seed-demo-curated:v3");
  });

  it("mostly uses primary demo patient", () => {
    const primary = DEMO_CURATED_ROWS.filter(
      (r) => r.patientEmail === DEMO_CURATED_PRIMARY_PATIENT_EMAIL
    );
    expect(primary.length).toBeGreaterThanOrEqual(6);
  });

  it("includes varied invoice created_by (admin and doctor)", () => {
    const withInvoice = DEMO_CURATED_ROWS.filter((r) => r.invoice.kind !== "none");
    const doctorCreated = withInvoice.filter(
      (r) => r.invoiceCreatedByEmail === DEMO_CURATED_PRIMARY_DOCTOR_EMAIL
    );
    const adminCreated = withInvoice.filter(
      (r) =>
        !r.invoiceCreatedByEmail ||
        r.invoiceCreatedByEmail === DEMO_CURATED_ADMIN_EMAIL
    );
    expect(doctorCreated.length).toBeGreaterThanOrEqual(2);
    expect(adminCreated.length).toBeGreaterThanOrEqual(2);
  });

  it("includes exactly one visit-cancelled row", () => {
    const cancelled = DEMO_CURATED_ROWS.filter((r) => r.status === "cancelled");
    expect(cancelled).toHaveLength(1);
    expect(cancelled[0]?.titleSuffix).toContain("visit-cancelled");
  });

  it("includes doctor-owner pending/alert rows for cancel QA", () => {
    const doctorOwner = DEMO_CURATED_ROWS.filter(
      (r) =>
        r.ownerEmail === DEMO_CURATED_PRIMARY_DOCTOR_EMAIL &&
        (r.status === "pending" || r.status === "alert")
    );
    expect(doctorOwner.length).toBeGreaterThanOrEqual(2);
  });

  it("resolveCuratedSlot returns end after start", () => {
    const { start, end } = resolveCuratedSlot(0, 10, 30);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });

  it("cancelled row specifies admin as canceller by default", () => {
    const row = DEMO_CURATED_ROWS.find((r) => r.status === "cancelled");
    expect(row?.cancelledByEmail ?? DEMO_CURATED_ADMIN_EMAIL).toBe(
      DEMO_CURATED_ADMIN_EMAIL
    );
  });
});
