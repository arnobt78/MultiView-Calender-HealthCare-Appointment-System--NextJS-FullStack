import { describe, expect, it, vi, beforeEach } from "vitest";

const { invoiceFindUnique, appointmentFindFirst, patientFindFirst } = vi.hoisted(() => ({
  invoiceFindUnique: vi.fn(),
  appointmentFindFirst: vi.fn(),
  patientFindFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: { findUnique: invoiceFindUnique, findFirst: vi.fn() },
    patient: { findFirst: patientFindFirst },
    appointment: {
      findFirst: appointmentFindFirst,
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    user: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/organization-invoice-access", () => ({
  userCanViewOrganizationInvoices: vi.fn(async () => false),
}));

import { accessLevelAllows, assertInvoiceRefundAccess, resolveInvoiceAccess } from "@/lib/invoice-access";
import { canPatientPayInvoiceStatus } from "@/lib/billing-status";

const INVOICE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const APPT_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

describe("invoice-access helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accessLevelAllows matrix", () => {
    expect(accessLevelAllows("admin", "admin")).toBe(true);
    expect(accessLevelAllows("admin", "mutate")).toBe(true);
    expect(accessLevelAllows("pay", "pay")).toBe(true);
    expect(accessLevelAllows("view", "pay")).toBe(false);
    expect(accessLevelAllows("none", "view")).toBe(false);
  });

  it("patient pay check via billing-status", () => {
    expect(canPatientPayInvoiceStatus("overdue")).toBe(true);
    expect(canPatientPayInvoiceStatus("cancelled")).toBe(false);
  });
});

describe("resolveInvoiceAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns none for invalid invoice id", async () => {
    const level = await resolveInvoiceAccess(
      { userId: "u1", email: "a@b.com", role: "patient" },
      "not-a-uuid"
    );
    expect(level).toBe("none");
  });

  it("returns admin for platform admin", async () => {
    invoiceFindUnique.mockResolvedValue({
      id: INVOICE_ID,
      user_id: "doc",
      appointment_id: APPT_ID,
      organization_id: null,
      status: "sent",
    });
    const level = await resolveInvoiceAccess(
      { userId: "admin", email: "admin@test.com", role: "admin" },
      INVOICE_ID
    );
    expect(level).toBe("admin");
  });

  it("returns pay for patient on payable invoice", async () => {
    invoiceFindUnique.mockResolvedValue({
      id: INVOICE_ID,
      user_id: "doc",
      appointment_id: APPT_ID,
      organization_id: null,
      status: "sent",
    });
    patientFindFirst.mockResolvedValue({ id: "p1" });
    appointmentFindFirst.mockResolvedValue({ id: APPT_ID });

    const level = await resolveInvoiceAccess(
      { userId: "p-user", email: "patient@test.com", role: "patient" },
      INVOICE_ID
    );
    expect(level).toBe("pay");
  });

  it("returns mutate for doctor owner on draft", async () => {
    invoiceFindUnique.mockResolvedValue({
      id: INVOICE_ID,
      user_id: "doc-1",
      appointment_id: APPT_ID,
      organization_id: null,
      status: "draft",
    });
    appointmentFindFirst.mockResolvedValue({ id: APPT_ID });

    const level = await resolveInvoiceAccess(
      { userId: "doc-1", email: "doc@test.com", role: "doctor" },
      INVOICE_ID
    );
    expect(level).toBe("mutate");
  });

  it("returns mutate for doctor owner on sent or overdue", async () => {
    for (const status of ["sent", "overdue"] as const) {
      invoiceFindUnique.mockResolvedValue({
        id: INVOICE_ID,
        user_id: "doc-1",
        appointment_id: APPT_ID,
        organization_id: null,
        status,
      });
      appointmentFindFirst.mockResolvedValue({ id: APPT_ID });

      const level = await resolveInvoiceAccess(
        { userId: "doc-1", email: "doc@test.com", role: "doctor" },
        INVOICE_ID
      );
      expect(level).toBe("mutate");
    }
  });

  it("returns view for linked doctor who is not invoice issuer on draft", async () => {
    invoiceFindUnique.mockResolvedValue({
      id: INVOICE_ID,
      user_id: "doc-issuer",
      appointment_id: APPT_ID,
      organization_id: null,
      status: "draft",
    });
    appointmentFindFirst.mockResolvedValue({ id: APPT_ID });

    const level = await resolveInvoiceAccess(
      { userId: "doc-owner", email: "owner@test.com", role: "doctor" },
      INVOICE_ID
    );
    expect(level).toBe("view");
  });

  it("returns mutate for doctor issuer on paid invoice (portal refund)", async () => {
    invoiceFindUnique.mockResolvedValue({
      id: INVOICE_ID,
      user_id: "doc-1",
      appointment_id: APPT_ID,
      organization_id: null,
      status: "paid",
    });
    appointmentFindFirst.mockResolvedValue({ id: APPT_ID });

    const level = await resolveInvoiceAccess(
      { userId: "doc-1", email: "doc@test.com", role: "doctor" },
      INVOICE_ID
    );
    expect(level).toBe("mutate");
  });

  it("returns view for unrelated linked doctor on paid invoice", async () => {
    invoiceFindUnique.mockResolvedValue({
      id: INVOICE_ID,
      user_id: "doc-issuer",
      appointment_id: APPT_ID,
      organization_id: null,
      status: "paid",
    });
    appointmentFindFirst.mockResolvedValue({ id: APPT_ID });

    const level = await resolveInvoiceAccess(
      { userId: "doc-unrelated", email: "x@test.com", role: "doctor" },
      INVOICE_ID
    );
    expect(level).toBe("view");
  });
});

describe("assertInvoiceRefundAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows admin on paid invoice", async () => {
    invoiceFindUnique.mockResolvedValue({
      id: INVOICE_ID,
      user_id: "doc-1",
      appointment_id: APPT_ID,
      organization_id: null,
      status: "paid",
    });
    const level = await assertInvoiceRefundAccess(
      { userId: "admin-1", email: "a@test.com", role: "admin" },
      INVOICE_ID
    );
    expect(level).toBe("admin");
  });

  it("allows doctor issuer on paid invoice", async () => {
    invoiceFindUnique.mockResolvedValue({
      id: INVOICE_ID,
      user_id: "doc-1",
      appointment_id: APPT_ID,
      organization_id: null,
      status: "paid",
    });
    const level = await assertInvoiceRefundAccess(
      { userId: "doc-1", email: "doc@test.com", role: "doctor" },
      INVOICE_ID
    );
    expect(level).toBe("mutate");
  });

  it("denies unrelated doctor", async () => {
    invoiceFindUnique.mockResolvedValue({
      id: INVOICE_ID,
      user_id: "doc-issuer",
      appointment_id: APPT_ID,
      organization_id: null,
      status: "paid",
    });
    const level = await assertInvoiceRefundAccess(
      { userId: "doc-other", email: "x@test.com", role: "doctor" },
      INVOICE_ID
    );
    expect(level).toBe("none");
  });
});
