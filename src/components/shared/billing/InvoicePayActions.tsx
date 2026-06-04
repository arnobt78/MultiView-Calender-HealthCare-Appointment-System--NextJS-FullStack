"use client";

import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canPatientPayInvoiceStatus } from "@/lib/billing-status";
import { skyGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { cn } from "@/lib/utils";

type Props = {
  status: string;
  onPay: () => void;
  isPaying?: boolean;
  size?: "sm" | "default";
  /** Patient portal — sky glass glow button. */
  glass?: boolean;
};

/** Patient-facing Pay Now — only for payable statuses. */
export function InvoicePayActions({
  status,
  onPay,
  isPaying = false,
  size = "sm",
  glass = false,
}: Props) {
  if (!canPatientPayInvoiceStatus(status)) return null;

  return (
    <Button
      type="button"
      size={size}
      className={cn(
        "gap-1.5",
        glass &&
          cn(
            skyGlassPrimaryButtonClass,
            "h-8 px-3.5 text-xs font-semibold"
          )
      )}
      disabled={isPaying}
      onClick={onPay}
    >
      <CreditCard className="h-3.5 w-3.5" />
      {isPaying ? "Redirecting…" : "Pay Now"}
    </Button>
  );
}
