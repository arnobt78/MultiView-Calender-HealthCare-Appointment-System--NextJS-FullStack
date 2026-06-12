/**
 * Rich FilterSelect options — icons + text colors aligned with badges app-wide.
 */

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  Banknote,
  Calendar,
  CalendarClock,
  CalendarDays,
  CalendarX,
  CheckCircle2,
  CircleOff,
  Clock,
  FileEdit,
  FileWarning,
  Image,
  ImageOff,
  ListFilter,
  Mail,
  MailWarning,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  User,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import type { FilterSelectOption } from "@/components/shared/filters/FilterSelect";
import {
  CALENDAR_CLINICAL_ROLE_ALL,
  CALENDAR_CLINICAL_ROLE_FILTER_OPTIONS,
  CALENDAR_CLINICAL_ROLE_OWNER,
  CALENDAR_CLINICAL_ROLE_TREATING,
} from "@/lib/calendar-clinical-role-filter";
import type { DoctorPortalInvoiceStatusFilter } from "@/lib/invoice-list-display";
import { invoiceStatusInlineTextClass } from "@/lib/invoice-status-display";
import { ORG_MEMBER_ROLE_OPTIONS } from "@/lib/organization-member-role";
import { PATIENT_CARE_LEVEL_STAGES } from "@/lib/patient-care-level";
import { getSpecialtyGlassVariant, SPECIALTIES } from "@/lib/doctor-specialty";

const MUTED_ICON = "text-gray-400";
const MUTED_TEXT = "text-gray-600";

const USER_ROLE_META = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    iconClassName: "text-indigo-600",
    textClassName: "text-indigo-700",
  },
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    iconClassName: "text-emerald-600",
    textClassName: "text-emerald-700",
  },
  patient: {
    label: "Patient",
    icon: User,
    iconClassName: "text-sky-600",
    textClassName: "text-sky-700",
  },
} as const;

const INVOICE_STATUS_META: Record<
  Exclude<DoctorPortalInvoiceStatusFilter, "all">,
  { icon: LucideIcon; label: string }
> = {
  draft: { icon: FileEdit, label: "Draft" },
  sent: { icon: Mail, label: "Sent" },
  paid: { icon: Banknote, label: "Paid" },
  overdue: { icon: FileWarning, label: "Overdue" },
  cancelled: { icon: XCircle, label: "Cancelled" },
  refunded: { icon: RotateCcw, label: "Refunded" },
};

const SPECIALTY_VARIANT_TEXT: Record<string, string> = {
  sky: "text-sky-700",
  rose: "text-rose-700",
  amber: "text-amber-800",
  indigo: "text-indigo-700",
  emerald: "text-emerald-700",
  violet: "text-violet-700",
  blue: "text-blue-700",
  teal: "text-teal-700",
  slate: "text-slate-700",
};

function richOption<T extends string>(
  value: T,
  label: string,
  icon: LucideIcon,
  textClassName: string,
  iconClassName?: string
): FilterSelectOption<T> {
  return {
    value,
    label,
    icon,
    textClassName,
    iconClassName: iconClassName ?? textClassName.replace("text-", "text-").replace("-700", "-600"),
  };
}

function allRolesOption<T extends string = "all">(label = "All Roles"): FilterSelectOption<T> {
  return {
    value: "all" as T,
    label,
    icon: ListFilter,
    iconClassName: MUTED_ICON,
    textClassName: MUTED_TEXT,
  };
}

/** Resolve display label from preset options. */
export function findFilterOptionLabel<T extends string>(
  options: readonly FilterSelectOption<T>[],
  value: T,
  fallback: string
): string {
  return options.find((o) => o.value === value)?.label ?? fallback;
}

export function userRoleFilterOptions(): FilterSelectOption<
  "all" | keyof typeof USER_ROLE_META
>[] {
  return [
    allRolesOption(),
    ...(
      Object.entries(USER_ROLE_META) as Array<
        [keyof typeof USER_ROLE_META, (typeof USER_ROLE_META)[keyof typeof USER_ROLE_META]]
      >
    ).map(([value, meta]) => ({
      value,
      label: meta.label,
      icon: meta.icon,
      iconClassName: meta.iconClassName,
      textClassName: meta.textClassName,
    })),
  ];
}

export function orgMemberRoleFilterOptions(): FilterSelectOption<string>[] {
  return [
    allRolesOption(),
    ...ORG_MEMBER_ROLE_OPTIONS.map((o) => {
      const meta = USER_ROLE_META[o.value];
      return {
        value: o.value,
        label: o.label,
        icon: o.icon,
        iconClassName: meta.iconClassName,
        textClassName: meta.textClassName,
      };
    }),
  ];
}

export function invoiceStatusFilterOptions(): FilterSelectOption<DoctorPortalInvoiceStatusFilter>[] {
  return [
    {
      value: "all",
      label: "All Statuses",
      icon: ListFilter,
      iconClassName: MUTED_ICON,
      textClassName: MUTED_TEXT,
    },
    ...(
      Object.keys(INVOICE_STATUS_META) as Array<
        Exclude<DoctorPortalInvoiceStatusFilter, "all">
      >
    ).map((status) => {
      const meta = INVOICE_STATUS_META[status];
      const textClass = invoiceStatusInlineTextClass(status);
      return {
        value: status,
        label: meta.label,
        icon: meta.icon,
        textClassName: textClass,
        iconClassName: textClass,
      };
    }),
  ];
}

export function activeInactiveFilterOptions(
  allLabel = "All Statuses"
): FilterSelectOption<"all" | "active" | "inactive">[] {
  return [
    {
      value: "all",
      label: allLabel,
      icon: ListFilter,
      iconClassName: MUTED_ICON,
      textClassName: MUTED_TEXT,
    },
    richOption("active", "Active", CheckCircle2, "text-emerald-700", "text-emerald-600"),
    richOption("inactive", "Inactive", CircleOff, "text-slate-600", "text-slate-500"),
  ];
}

export function verificationFilterOptions(): FilterSelectOption<
  "all" | "verified" | "unverified"
>[] {
  return [
    {
      value: "all",
      label: "All Verification",
      icon: ListFilter,
      iconClassName: MUTED_ICON,
      textClassName: MUTED_TEXT,
    },
    richOption("verified", "Verified", ShieldCheck, "text-emerald-700", "text-emerald-600"),
    richOption("unverified", "Unverified", MailWarning, "text-amber-800", "text-amber-700"),
  ];
}

export function photoFilterOptions(): FilterSelectOption<
  "all" | "with_photo" | "no_photo"
>[] {
  return [
    {
      value: "all",
      label: "All Photos",
      icon: ListFilter,
      iconClassName: MUTED_ICON,
      textClassName: MUTED_TEXT,
    },
    richOption("with_photo", "With Photo", Image, "text-sky-700", "text-sky-600"),
    richOption("no_photo", "No Photo", ImageOff, "text-slate-600", "text-slate-500"),
  ];
}

export function careTierFilterOptions(): FilterSelectOption<string>[] {
  return [
    {
      value: "all",
      label: "All Care Tiers",
      icon: Activity,
      iconClassName: MUTED_ICON,
      textClassName: MUTED_TEXT,
    },
    {
      value: "unset",
      label: "No Tier Set",
      icon: Activity,
      iconClassName: "text-slate-400",
      textClassName: "text-slate-600",
    },
    ...PATIENT_CARE_LEVEL_STAGES.map((s) => ({
      value: String(s.value),
      label: `${s.value} — ${s.shortLabel}`,
      icon: Activity,
      iconClassName: "text-violet-600",
      textClassName: "text-violet-700",
    })),
  ];
}

/** Dashboard calendar — `allValue` is `__all__` when clearing to null. */
export function appointmentCalendarStatusFilterOptions(
  allValue = "__all__"
): FilterSelectOption<string>[] {
  return [
    {
      value: allValue,
      label: "All Statuses",
      icon: ListFilter,
      iconClassName: MUTED_ICON,
      textClassName: MUTED_TEXT,
    },
    richOption("pending", "Open", Clock, "text-sky-700", "text-sky-600"),
    richOption("done", "Done", CheckCircle2, "text-emerald-700", "text-emerald-600"),
    richOption("alert", "Alert", AlertTriangle, "text-amber-800", "text-amber-700"),
    richOption("cancelled", "Cancelled", XCircle, "text-rose-700", "text-rose-600"),
  ];
}

export function calendarClinicalRoleFilterOptions(): FilterSelectOption<string>[] {
  const iconByValue: Record<string, { icon: LucideIcon; textClassName: string; iconClassName: string }> = {
    [CALENDAR_CLINICAL_ROLE_ALL]: {
      icon: Calendar,
      textClassName: MUTED_TEXT,
      iconClassName: MUTED_ICON,
    },
    [CALENDAR_CLINICAL_ROLE_OWNER]: {
      icon: UserPlus,
      textClassName: "text-indigo-700",
      iconClassName: "text-indigo-600",
    },
    [CALENDAR_CLINICAL_ROLE_TREATING]: {
      icon: ArrowRightLeft,
      textClassName: "text-emerald-700",
      iconClassName: "text-emerald-600",
    },
  };

  return CALENDAR_CLINICAL_ROLE_FILTER_OPTIONS.map((o) => {
    const meta = iconByValue[o.value] ?? {
      icon: Calendar,
      textClassName: MUTED_TEXT,
      iconClassName: MUTED_ICON,
    };
    return {
      value: o.value,
      label: o.label,
      icon: meta.icon,
      textClassName: meta.textClassName,
      iconClassName: meta.iconClassName,
    };
  });
}

export function doctorAvailabilityFilterOptions(): FilterSelectOption<
  "all" | "with" | "without"
>[] {
  return [
    {
      value: "all",
      label: "All Availability",
      icon: ListFilter,
      iconClassName: MUTED_ICON,
      textClassName: MUTED_TEXT,
    },
    richOption("with", "With Hours", CalendarClock, "text-emerald-700", "text-emerald-600"),
    richOption("without", "No Hours", CalendarX, "text-slate-600", "text-slate-500"),
  ];
}

export function doctorSpecialtyFilterOptions(
  specialties: readonly string[] = SPECIALTIES
): FilterSelectOption<string>[] {
  return [
    {
      value: "all",
      label: "All Specialties",
      icon: Stethoscope,
      iconClassName: MUTED_ICON,
      textClassName: MUTED_TEXT,
    },
    ...specialties.map((specialty) => {
      const variant = getSpecialtyGlassVariant(specialty);
      const textClass = SPECIALTY_VARIANT_TEXT[variant] ?? "text-slate-700";
      return {
        value: specialty,
        label: specialty,
        icon: Stethoscope,
        textClassName: textClass,
        iconClassName: textClass,
      };
    }),
  ];
}

export function orgMemberSizeFilterOptions(): FilterSelectOption<
  "all" | "solo" | "small" | "large"
>[] {
  return [
    {
      value: "all",
      label: "Any Size",
      icon: Users,
      iconClassName: MUTED_ICON,
      textClassName: MUTED_TEXT,
    },
    richOption("solo", "Solo (1)", User, "text-slate-700", "text-slate-600"),
    richOption("small", "Small (2–5)", Users, "text-sky-700", "text-sky-600"),
    richOption("large", "Large (6+)", Users, "text-indigo-700", "text-indigo-600"),
  ];
}

export function orgInvoiceBillingFilterOptions(): FilterSelectOption<
  "all" | "has_invoices" | "outstanding" | "none"
>[] {
  return [
    {
      value: "all",
      label: "All Billing",
      icon: Receipt,
      iconClassName: MUTED_ICON,
      textClassName: MUTED_TEXT,
    },
    richOption("has_invoices", "Has Invoices", Receipt, "text-sky-700", "text-sky-600"),
    richOption("outstanding", "Outstanding Balance", FileWarning, "text-rose-700", "text-rose-600"),
    richOption("none", "No Invoices", Receipt, "text-slate-600", "text-slate-500"),
  ];
}

export function weekdayFilterOptions(
  weekdayLabels: readonly string[]
): FilterSelectOption<string>[] {
  return weekdayLabels.map((label, index) => ({
    value: String(index),
    label,
    icon: CalendarDays,
    iconClassName: "text-indigo-600",
    textClassName: "text-gray-700",
  }));
}

/** Weekday filter with muted “all” row — value `"all"` clears the filter. */
export function allWeekdayFilterOptions(
  weekdayLabels: readonly string[],
  allLabel = "All Days"
): FilterSelectOption<string>[] {
  return [
    {
      value: "all",
      label: allLabel,
      icon: ListFilter,
      iconClassName: MUTED_ICON,
      textClassName: MUTED_TEXT,
    },
    ...weekdayFilterOptions(weekdayLabels),
  ];
}
