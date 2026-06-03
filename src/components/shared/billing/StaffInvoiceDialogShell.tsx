"use client";

import { InvoiceFormDialogProvider } from "@/context/InvoiceFormDialogContext";

type Props = {
  children: React.ReactNode;
  variant?: "admin" | "doctor";
};

/** Mount once per staff layout — shared invoice create/edit dialog for calendar + lists. */
export function StaffInvoiceDialogShell({ children, variant }: Props) {
  return (
    <InvoiceFormDialogProvider variant={variant}>{children}</InvoiceFormDialogProvider>
  );
}
