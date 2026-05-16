"use client";

import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { DoctorSpecialtyBadge } from "@/components/shared/doctor-display/DoctorSpecialtyBadge";
import type { ServiceCatalogDoctorOffer } from "@/lib/appointment-service-catalog";

const MAX_VISIBLE = 2;

type Props = {
  offers: ServiceCatalogDoctorOffer[];
};

/**
 * Inline “Offered by” + role-aware doctor link (sky-700) + specialty badge — wraps on narrow cards.
 */
export function ServiceCatalogDoctorOffers({ offers }: Props) {
  if (offers.length === 0) return null;

  const visible = offers.slice(0, MAX_VISIBLE);
  const extra = offers.length - visible.length;

  return (
    <div className="mt-1.5 flex flex-col gap-1.5 min-w-0">
      {visible.map((offer) => (
        <div
          key={offer.id}
          className="flex flex-wrap items-center gap-x-1.5 gap-y-1 min-w-0 text-xs leading-snug"
        >
          <span className="text-muted-foreground shrink-0">Offered by</span>
          <RoleEntityLink
            kind="doctor"
            id={offer.id}
            label={offer.label}
            className="text-xs font-medium min-w-0 max-w-full"
          />
          <DoctorSpecialtyBadge specialty={offer.specialty} className="shrink-0" />
        </div>
      ))}
      {extra > 0 ? (
        <p className="text-xs text-muted-foreground">+{extra} more doctor{extra !== 1 ? "s" : ""}</p>
      ) : null}
    </div>
  );
}
