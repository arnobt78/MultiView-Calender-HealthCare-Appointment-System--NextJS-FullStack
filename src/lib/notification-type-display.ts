/**
 * Per-type visual config for in-app notifications — shared by navbar bell, CP list, filters.
 * Add new types here as the notification system grows.
 */

import {
  AlarmClock,
  Banknote,
  Bell,
  CalendarCheck2,
  CalendarPlus,
  FileEdit,
  MailWarning,
  RefreshCcw,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { BILLING_NOTIFICATION_TYPES } from "@/lib/billing-notify";

export type NotificationTypeVisualConfig = {
  label: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  badgeClass: string;
  dotClass: string;
};

/** Known notification types for filters and metrics (includes billing SSE types). */
export const KNOWN_NOTIFICATION_TYPES = [
  "appointment_created",
  "status_update",
  "booking",
  "reminder",
  ...BILLING_NOTIFICATION_TYPES,
] as const;

export type KnownNotificationType = (typeof KNOWN_NOTIFICATION_TYPES)[number];

const NOTIF_TYPE_CONFIG: Record<string, NotificationTypeVisualConfig> = {
  appointment_created: {
    label: "Scheduled",
    icon: CalendarPlus,
    iconBg: "bg-sky-100/80",
    iconColor: "text-sky-600",
    iconBorder: "border-sky-200/80",
    badgeClass: "bg-sky-100/80 text-sky-700 border-sky-200/70 backdrop-blur-sm",
    dotClass: "bg-sky-500",
  },
  status_update: {
    label: "Status",
    icon: RefreshCcw,
    iconBg: "bg-amber-100/80",
    iconColor: "text-amber-600",
    iconBorder: "border-amber-200/80",
    badgeClass: "bg-amber-100/80 text-amber-700 border-amber-200/70 backdrop-blur-sm",
    dotClass: "bg-amber-500",
  },
  booking: {
    label: "Booking",
    icon: CalendarCheck2,
    iconBg: "bg-emerald-100/80",
    iconColor: "text-emerald-600",
    iconBorder: "border-emerald-200/80",
    badgeClass: "bg-emerald-100/80 text-emerald-700 border-emerald-200/70 backdrop-blur-sm",
    dotClass: "bg-emerald-500",
  },
  reminder: {
    label: "Reminder",
    icon: AlarmClock,
    iconBg: "bg-purple-100/80",
    iconColor: "text-purple-600",
    iconBorder: "border-purple-200/80",
    badgeClass: "bg-purple-100/80 text-purple-700 border-purple-200/70 backdrop-blur-sm",
    dotClass: "bg-purple-500",
  },
  invoice_draft: {
    label: "Invoice draft",
    icon: FileEdit,
    iconBg: "bg-violet-100/80",
    iconColor: "text-violet-600",
    iconBorder: "border-violet-200/80",
    badgeClass: "bg-violet-100/80 text-violet-700 border-violet-200/70 backdrop-blur-sm",
    dotClass: "bg-violet-500",
  },
  invoice_paid: {
    label: "Invoice paid",
    icon: Banknote,
    iconBg: "bg-emerald-100/80",
    iconColor: "text-emerald-600",
    iconBorder: "border-emerald-200/80",
    badgeClass: "bg-emerald-100/80 text-emerald-700 border-emerald-200/70 backdrop-blur-sm",
    dotClass: "bg-emerald-500",
  },
  invoice_failed: {
    label: "Payment failed",
    icon: MailWarning,
    iconBg: "bg-rose-100/80",
    iconColor: "text-rose-600",
    iconBorder: "border-rose-200/80",
    badgeClass: "bg-rose-100/80 text-rose-700 border-rose-200/70 backdrop-blur-sm",
    dotClass: "bg-rose-500",
  },
  invoice_refunded: {
    label: "Refunded",
    icon: RotateCcw,
    iconBg: "bg-amber-100/80",
    iconColor: "text-amber-600",
    iconBorder: "border-amber-200/80",
    badgeClass: "bg-amber-100/80 text-amber-700 border-amber-200/70 backdrop-blur-sm",
    dotClass: "bg-amber-500",
  },
};

const DEFAULT_NOTIF_CONFIG: NotificationTypeVisualConfig = {
  label: "Notification",
  icon: Bell,
  iconBg: "bg-gray-100/80",
  iconColor: "text-gray-500",
  iconBorder: "border-gray-200/80",
  badgeClass: "bg-gray-100/80 text-gray-600 border-gray-200/70 backdrop-blur-sm",
  dotClass: "bg-gray-400",
};

/** Returns visual config for a notification type with safe fallback for unknown types. */
export function getNotificationTypeConfig(type: string): NotificationTypeVisualConfig {
  const known = NOTIF_TYPE_CONFIG[type];
  if (known) return known;
  return {
    ...DEFAULT_NOTIF_CONFIG,
    label: type.replace(/_/g, " "),
  };
}

/** True when type is one of the billing invoice notification types. */
export function isBillingNotificationDisplayType(type: string): boolean {
  return (BILLING_NOTIFICATION_TYPES as readonly string[]).includes(type);
}

/** Search blob for CP list global filter — title, message, type label. */
export function getNotificationListSearchBlob(row: {
  title: string;
  message: string;
  type: string;
}): string {
  const cfg = getNotificationTypeConfig(row.type);
  return `${row.title} ${row.message} ${row.type} ${cfg.label}`.toLowerCase();
}

/** Internal app paths use Next Link; external URLs keep anchor target=_blank. */
export function isInternalNotificationLink(link: string | undefined | null): boolean {
  const trimmed = link?.trim();
  return Boolean(trimmed && trimmed.startsWith("/") && !trimmed.startsWith("//"));
}
