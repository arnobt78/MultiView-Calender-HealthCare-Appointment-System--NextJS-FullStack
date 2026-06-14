"use client";

/**
 * @deprecated Use `InvoiceFormDialog` with controlled `open` / `onOpenChange` from parent.
 * Thin wrapper kept for call sites migrating to lifted dialog state.
 */

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  InvoiceFormDialog,
  type InvoiceCreateBody,
} from "@/components/shared/billing/invoice-dialog/InvoiceFormDialog";

type Props = {
  variant: "admin" | "doctor";
  /** Pass `{ onSuccess }` from mutation opts — wrapper closes dialog only after success. */
  onCreate: (body: InvoiceCreateBody, opts?: { onSuccess?: () => void }) => void;
  appointmentId?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerIcon?: LucideIcon;
  isSubmitting?: boolean;
};

export function CreateInvoiceDialog({
  variant,
  onCreate,
  appointmentId,
  triggerLabel = "New Invoice",
  triggerClassName,
  triggerIcon: TriggerIcon = Plus,
  isSubmitting = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [formSession, setFormSession] = useState(0);

  return (
    <InvoiceFormDialog
      open={open}
      onOpenChange={setOpen}
      formSession={formSession}
      mode="create"
      variant={variant}
      appointmentId={appointmentId}
      isSubmitting={isSubmitting}
      onCreate={(body) => {
        onCreate(body, { onSuccess: () => setOpen(false) });
      }}
      trigger={
        <Button
          type="button"
          size="sm"
          className={cn("gap-2", triggerClassName)}
          onClick={() => {
            setFormSession((s) => s + 1);
            setOpen(true);
          }}
        >
          <TriggerIcon className="h-4 w-4" aria-hidden /> {triggerLabel}
        </Button>
      }
    />
  );
}

export type { InvoiceCreateBody };
