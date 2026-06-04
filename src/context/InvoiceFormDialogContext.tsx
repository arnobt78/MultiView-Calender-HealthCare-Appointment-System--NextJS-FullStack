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
 * One invoice create/edit dialog per doctor/admin layout — calendar + portal billing call
 * openCreateForAppointment without prop drilling. Patients skip provider (passthrough).
 *
 * When `variant` is set (doctor-portal, CP, appointments layout), always mount the provider
 * so children can call useInvoiceFormDialog before /api/auth/me hydrates role.
 */
export function InvoiceFormDialogProvider({
  children,
  variant,
  invoicesInitialData,
}: ProviderProps) {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const isDoctorOrAdmin = isAdminRole(role) || isDoctorRole(role);
  /** Layout declares doctor/admin shell — do not omit context while auth role is still null. */
  const mountProvider = variant != null || isDoctorOrAdmin;
  const controller = useInvoiceFormDialogController({
    ...(variant ? { variant } : {}),
    invoicesInitialData,
  });

  const value = useMemo(() => controller, [controller]);

  if (!mountProvider) {
    return <>{children}</>;
  }

  return (
    <InvoiceFormDialogContext.Provider value={value}>
      {children}
      {controller.dialogNode}
    </InvoiceFormDialogContext.Provider>
  );
}

/** Access shared invoice dialog — must be under InvoiceFormDialogProvider on doctor/admin layouts. */
export function useInvoiceFormDialog(): InvoiceFormDialogContextValue {
  const ctx = useContext(InvoiceFormDialogContext);
  if (!ctx) {
    throw new Error(
      "useInvoiceFormDialog must be used within InvoiceFormDialogProvider on doctor or admin layouts"
    );
  }
  return ctx;
}

/** Safe optional hook for components that may render outside provider. */
export function useInvoiceFormDialogOptional(): InvoiceFormDialogContextValue | null {
  return useContext(InvoiceFormDialogContext);
}
