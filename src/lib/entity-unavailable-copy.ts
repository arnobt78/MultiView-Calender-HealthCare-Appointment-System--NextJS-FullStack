/**
 * Copy presets for EntityUnavailableScreen — stale deep-links and deleted entities.
 */

export type EntityUnavailableKind = "appointment" | "invoice";

export type EntityUnavailableCopy = {
  title: string;
  subtitle: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export function getEntityUnavailableCopy(
  kind: EntityUnavailableKind,
  variant: "control-panel" | "portal" = "control-panel"
): EntityUnavailableCopy {
  if (kind === "appointment") {
    if (variant === "portal") {
      return {
        title: "This appointment was removed",
        subtitle:
          "It may have been deleted from the calendar. Your notification is kept for your records.",
        primaryHref: "/dashboard",
        primaryLabel: "Dashboard",
        secondaryHref: "/doctor-portal",
        secondaryLabel: "Back to portal",
      };
    }
    return {
      title: "This appointment was removed",
      subtitle:
        "It may have been deleted from the calendar. Your notification is kept for your records.",
      primaryHref: "/control-panel/notifications",
      primaryLabel: "Back to notifications",
      secondaryHref: "/control-panel/appointment-management",
      secondaryLabel: "Appointment management",
    };
  }

  if (variant === "portal") {
    return {
      title: "This invoice is no longer available",
      subtitle: "It may have been deleted or you no longer have access to view it.",
      primaryHref: "/dashboard",
      primaryLabel: "Dashboard",
      secondaryHref: "/doctor-portal",
      secondaryLabel: "Back to portal",
    };
  }

  return {
    title: "This invoice is no longer available",
    subtitle: "It may have been deleted or you no longer have access to view it.",
    primaryHref: "/control-panel/notifications",
    primaryLabel: "Back to notifications",
    secondaryHref: "/control-panel/invoice-management",
    secondaryLabel: "Invoice management",
  };
}
