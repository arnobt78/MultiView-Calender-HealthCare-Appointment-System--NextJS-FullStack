import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AppointmentCancelConfirmDialog } from "@/components/shared/appointment-detail/AppointmentCancelConfirmDialog";

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="cancel-dialog">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogMedia: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  AlertDialogAction: ({
    children,
    disabled,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
  }) => <button disabled={disabled}>{children}</button>,
}));

const paidStripe = {
  id: "inv-1",
  status: "paid",
  amount: 6900,
  currency: "eur",
  user_id: "doc-1",
  appointment_id: "appt-1",
  payments: [{ status: "succeeded", stripe_payment_id: "pi_123" }],
};

describe("AppointmentCancelConfirmDialog", () => {
  it("renders dynamic cancel copy when appointment title provided", () => {
    const markup = renderToStaticMarkup(
      <AppointmentCancelConfirmDialog
        open
        role="doctor"
        userId="doc-1"
        paidInvoice={null}
        appointmentTitle="Initial Consultation"
        appointmentStart="2026-06-22T14:00:00.000Z"
        appointmentEnd="2026-06-22T15:00:00.000Z"
        patientLabel="Demo Patient"
        onConfirm={vi.fn()}
      />
    );
    expect(markup).toContain("Initial Consultation");
    expect(markup).toContain("Cancel &quot;Initial Consultation&quot;?");
    expect(markup).toContain("marked cancelled");
    expect(markup).toContain("Demo Patient");
  });

  it("renders base cancel copy without appointment context", () => {
    const markup = renderToStaticMarkup(
      <AppointmentCancelConfirmDialog
        open
        role="doctor"
        userId="doc-1"
        paidInvoice={null}
        onConfirm={vi.fn()}
      />
    );
    expect(markup).toContain("marked cancelled");
    expect(markup).not.toContain("Also refund");
  });

  it("shows default-on refund checkbox for doctor issuer with Stripe payment", () => {
    const markup = renderToStaticMarkup(
      <AppointmentCancelConfirmDialog
        open
        role="doctor"
        userId="doc-1"
        paidInvoice={paidStripe}
        onConfirm={vi.fn()}
      />
    );
    expect(markup).toContain("Also refund");
    expect(markup).toMatch(/69,00/);
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain("checked");
  });

  it("hides refund checkbox for unrelated doctor", () => {
    const markup = renderToStaticMarkup(
      <AppointmentCancelConfirmDialog
        open
        role="doctor"
        userId="doc-other"
        paidInvoice={paidStripe}
        onConfirm={vi.fn()}
      />
    );
    expect(markup).not.toContain("Also refund");
  });

  it("hides refund checkbox for manual mark-paid without Stripe id", () => {
    const markup = renderToStaticMarkup(
      <AppointmentCancelConfirmDialog
        open
        role="admin"
        userId="admin-1"
        paidInvoice={{
          ...paidStripe,
          payments: [{ status: "succeeded" }],
        }}
        onConfirm={vi.fn()}
      />
    );
    expect(markup).not.toContain("Also refund");
  });

  it("shows spinner label while confirmPending", () => {
    const markup = renderToStaticMarkup(
      <AppointmentCancelConfirmDialog
        open
        role="doctor"
        userId="doc-1"
        paidInvoice={null}
        confirmPending
        onConfirm={vi.fn()}
      />
    );
    expect(markup).toContain("Cancelling…");
    expect(markup).toContain("animate-spin");
    expect(markup).toContain("disabled");
  });
});
