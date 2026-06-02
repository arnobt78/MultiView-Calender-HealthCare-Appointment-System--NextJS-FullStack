/**
 * Invoice revenue KPI card presets — shared by /insights and CP billing panels.
 */

import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  Banknote,
  Calculator,
  CreditCard,
  FileEdit,
  FileStack,
  FileWarning,
  Mail,
  RotateCcw,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import type { PatientStatCardVariant } from "@/components/control-panel/PatientStatCard";
import type { InvoiceBillingBucket, InvoiceStatusKey } from "@/lib/invoice-billing-totals";

export type InvoiceRevenueKpiCardPreset = {
  id: string;
  variant: PatientStatCardVariant;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badgeLabel: string;
  bucket: InvoiceBillingBucket;
};

export function invoiceKpiCountBadge(count: number, label: string): string | undefined {
  if (count <= 0) return undefined;
  const plural = count === 1 ? label : `${label}s`;
  return `${count} ${plural}`;
}

export const INVOICE_STATUS_KPI_PRESETS: Record<
  InvoiceStatusKey,
  Omit<InvoiceRevenueKpiCardPreset, "bucket">
> = {
  paid: {
    id: "status-paid",
    variant: "emerald",
    icon: Banknote,
    title: "Paid",
    subtitle: "Settled invoices",
    badgeLabel: "paid",
  },
  draft: {
    id: "status-draft",
    variant: "amber",
    icon: FileEdit,
    title: "Draft",
    subtitle: "Not yet sent",
    badgeLabel: "draft",
  },
  sent: {
    id: "status-sent",
    variant: "sky",
    icon: Mail,
    title: "Sent",
    subtitle: "Awaiting payment",
    badgeLabel: "sent",
  },
  overdue: {
    id: "status-overdue",
    variant: "rose",
    icon: FileWarning,
    title: "Overdue",
    subtitle: "Past due date",
    badgeLabel: "overdue",
  },
  refunded: {
    id: "status-refunded",
    variant: "violet",
    icon: RotateCcw,
    title: "Refunded",
    subtitle: "Returned to payer",
    badgeLabel: "refunded",
  },
  cancelled: {
    id: "status-cancelled",
    variant: "sky",
    icon: XCircle,
    title: "Cancelled",
    subtitle: "Voided invoices",
    badgeLabel: "cancelled",
  },
};

export const INVOICE_ROLLUP_OUTSTANDING_PRESET: Omit<InvoiceRevenueKpiCardPreset, "bucket"> = {
  id: "rollup-outstanding",
  variant: "amber",
  icon: CreditCard,
  title: "Outstanding",
  subtitle: "Draft, sent, or overdue",
  badgeLabel: "open",
};

export const INVOICE_INSIGHTS_PAID_IN_PERIOD_PRESET = {
  id: "insights-paid-in-period",
  variant: "emerald" as const,
  icon: BadgeDollarSign,
  title: "Paid in period",
  subtitle: "Collected revenue (paid date)",
  badgeLabel: "paid",
};

export const INVOICE_INSIGHTS_VS_PREVIOUS_PRESET = {
  id: "insights-vs-previous",
  variant: "sky" as const,
  icon: TrendingUp,
  title: "Vs previous period",
  subtitle: "Change vs the prior period of equal length",
  badgeLabel: "change",
};

export const INVOICE_EXTRA_TOTAL_PRESET = {
  id: "extra-total-invoices",
  variant: "sky" as const,
  icon: FileStack,
  title: "Total invoices",
  subtitle: "All statuses combined",
  badgeLabel: "invoice",
};

export const INVOICE_EXTRA_AVG_PRESET = {
  id: "extra-avg-invoice",
  variant: "violet" as const,
  icon: Calculator,
  title: "Avg invoice",
  subtitle: "Mean amount per invoice",
  badgeLabel: "invoice",
};

export const INVOICE_EXTRA_PAYMENT_SUCCESS_PRESET = {
  id: "extra-payment-success",
  variant: "emerald" as const,
  icon: Zap,
  title: "Payment success",
  subtitle: "Succeeded payment attempts",
  badgeLabel: "payment",
};
