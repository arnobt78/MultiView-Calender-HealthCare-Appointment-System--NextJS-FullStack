/**
 * FilterSelect presets for CP notifications list toolbar.
 */

import {
  AlarmClock,
  Banknote,
  Bell,
  CalendarCheck2,
  CalendarPlus,
  CheckCheck,
  CircleOff,
  Clock,
  ExternalLink,
  FileEdit,
  Link2,
  ListFilter,
  MailWarning,
  RefreshCcw,
  RotateCcw,
} from "lucide-react";
import type { FilterSelectOption } from "@/components/shared/filters/FilterSelect";
import { KNOWN_NOTIFICATION_TYPES, getNotificationTypeConfig } from "@/lib/notification-type-display";

const MUTED_ICON = "text-gray-400";
const MUTED_TEXT = "text-gray-600";

export type NotificationReadStatusFilter = "all" | "unread" | "read";

export type NotificationTypeFilter = "all" | (typeof KNOWN_NOTIFICATION_TYPES)[number] | "other";

export type NotificationLinkFilter = "all" | "has_link" | "no_link";

export type NotificationRecencyFilter = "all" | "today" | "7d" | "30d";

export function notificationReadStatusFilterOptions(): FilterSelectOption<NotificationReadStatusFilter>[] {
  return [
    { value: "all", label: "All", icon: ListFilter, iconClassName: MUTED_ICON, textClassName: MUTED_TEXT },
    { value: "unread", label: "Unread", icon: Bell, iconClassName: "text-rose-600", textClassName: "text-rose-700" },
    { value: "read", label: "Read", icon: CheckCheck, iconClassName: "text-emerald-600", textClassName: "text-emerald-700" },
  ];
}

const TYPE_FILTER_ICONS: Record<string, typeof Bell> = {
  appointment_created: CalendarPlus,
  status_update: RefreshCcw,
  booking: CalendarCheck2,
  reminder: AlarmClock,
  invoice_draft: FileEdit,
  invoice_paid: Banknote,
  invoice_failed: MailWarning,
  invoice_refunded: RotateCcw,
};

/** Rich type filter — known DB types + Other bucket for unknown types. */
export function notificationTypeFilterOptions(): FilterSelectOption<NotificationTypeFilter>[] {
  const known = KNOWN_NOTIFICATION_TYPES.map((type) => {
    const cfg = getNotificationTypeConfig(type);
    const Icon = TYPE_FILTER_ICONS[type] ?? Bell;
    return {
      value: type,
      label: cfg.label,
      icon: Icon,
      iconClassName: cfg.iconColor,
      textClassName: cfg.badgeClass.includes("text-")
        ? cfg.badgeClass.split(" ").find((c) => c.startsWith("text-")) ?? "text-gray-700"
        : "text-gray-700",
    } satisfies FilterSelectOption<NotificationTypeFilter>;
  });
  return [
    { value: "all", label: "All types", icon: ListFilter, iconClassName: MUTED_ICON, textClassName: MUTED_TEXT },
    ...known,
    { value: "other", label: "Other", icon: CircleOff, iconClassName: MUTED_ICON, textClassName: MUTED_TEXT },
  ];
}

export function notificationLinkFilterOptions(): FilterSelectOption<NotificationLinkFilter>[] {
  return [
    { value: "all", label: "All links", icon: ListFilter, iconClassName: MUTED_ICON, textClassName: MUTED_TEXT },
    { value: "has_link", label: "Has link", icon: Link2, iconClassName: "text-sky-600", textClassName: "text-sky-700" },
    { value: "no_link", label: "No link", icon: ExternalLink, iconClassName: MUTED_ICON, textClassName: MUTED_TEXT },
  ];
}

export function notificationRecencyFilterOptions(): FilterSelectOption<NotificationRecencyFilter>[] {
  return [
    { value: "all", label: "All time", icon: ListFilter, iconClassName: MUTED_ICON, textClassName: MUTED_TEXT },
    { value: "today", label: "Today", icon: Clock, iconClassName: "text-sky-600", textClassName: "text-sky-700" },
    { value: "7d", label: "Last 7 days", icon: Clock, iconClassName: "text-violet-600", textClassName: "text-violet-700" },
    { value: "30d", label: "Last 30 days", icon: Clock, iconClassName: "text-indigo-600", textClassName: "text-indigo-700" },
  ];
}
