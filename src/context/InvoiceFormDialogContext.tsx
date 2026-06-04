"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  useInvoiceFormDialogController,
  type InvoiceFormDialogVariant,
} from "@/hooks/useInvoiceFormDialogController";
import { useAuth } from "@/hooks/useAuth";
import type { Invoice } from "@/hooks/usePayments";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";

type InvoiceFormDialogContextValue = ReturnType<typeof useInvoiceFormDialogController>;

const InvoiceFormDialogContext = createContext<InvoiceFormDialogContextValue | null>(
  null
);

type ProviderProps = {
  children: ReactNode;
  /** Force variant when nav role is ambiguous (e.g. CP admin shell). */
  variant?: InvoiceFormDialogVariant;
  /** SSR invoices.all — avoids list GET when opening dialog on deep-linked staff routes. */
  invoicesInitialData?: Invoice[];
};

/**
 * One invoice create/edit dialog per staff layout — calendar + appointment menus call
 * openCreateForAppointment without prop drilling. Patients skip provider (no-op passthrough).
 */
export function InvoiceFormDialogProvider({
  children,
  variant,
  invoicesInitialData,
}: ProviderProps) {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const isStaff = isAdminRole(role) || isDoctorRole(role);
  const controller = useInvoiceFormDialogController({
    ...(variant ? { variant } : {}),
    invoicesInitialData,
  });

  const value = useMemo(() => controller, [controller]);

  if (!isStaff) {
    return <>{children}</>;
  }

  return (
    <InvoiceFormDialogContext.Provider value={value}>
      {children}
      {controller.dialogNode}
    </InvoiceFormDialogContext.Provider>
  );
}

/** Access shared invoice dialog — must be under InvoiceFormDialogProvider (staff routes). */
export function useInvoiceFormDialog(): InvoiceFormDialogContextValue {
  const ctx = useContext(InvoiceFormDialogContext);
  if (!ctx) {
    throw new Error(
      "useInvoiceFormDialog must be used within InvoiceFormDialogProvider on staff routes"
    );
  }
  return ctx;
}

/** Safe optional hook for components that may render outside provider. */
export function useInvoiceFormDialogOptional(): InvoiceFormDialogContextValue | null {
  return useContext(InvoiceFormDialogContext);
}
