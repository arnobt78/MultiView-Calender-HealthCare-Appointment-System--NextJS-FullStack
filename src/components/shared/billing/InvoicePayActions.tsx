"use client";

import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canPatientPayInvoiceStatus } from "@/lib/billing-status";

type Props = {
  status: string;
  onPay: () => void;
  isPaying?: boolean;
  size?: "sm" | "default";
};

/** Patient-facing Pay Now — only for payable statuses. */
export function InvoicePayActions({
  status,
  onPay,
  isPaying = false,
  size = "sm",
}: Props) {
  if (!canPatientPayInvoiceStatus(status)) return null;

  return (
    <Button
      type="button"
      size={size}
      className="gap-1.5"
      disabled={isPaying}
      onClick={onPay}
    >
      <CreditCard className="h-3.5 w-3.5" />
      {isPaying ? "Redirecting…" : "Pay Now"}
    </Button>
  );
}
