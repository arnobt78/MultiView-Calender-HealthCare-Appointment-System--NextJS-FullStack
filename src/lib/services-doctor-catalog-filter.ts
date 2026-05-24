import {
  SERVICES_CATALOG_FILTER_ADDITIONAL,
  SERVICES_CATALOG_FILTER_ALL,
  SERVICES_CATALOG_FILTER_GLOBAL,
  type ServiceCatalogRow,
  type ServicesCatalogFilterState,
} from "@/lib/appointment-service-catalog";
import type { DoctorBookableTypeRow } from "@/lib/doctor-bookable-types";

/** `/services` doctor card — `bookable_appointment_types` from GET /api/doctors. */
export type ServicesDoctorFilterInput = {
  id: string;
  appointment_types: { id: string; name: string }[];
  bookable_appointment_types?: DoctorBookableTypeRow[];
};

/**
 * Whether a doctor offers the selected catalog row / bucket (uses bookable merge + additional `doctor_offers`).
 */
export function doctorMatchesServiceCatalogSelection(
  doctor: ServicesDoctorFilterInput,
  selection: ServicesCatalogFilterState["selection"],
  catalog: ServiceCatalogRow[]
): boolean {
  if (selection === SERVICES_CATALOG_FILTER_ALL) return true;

  const bookable = doctor.bookable_appointment_types ?? [];
  const owned = doctor.appointment_types;

  if (selection === SERVICES_CATALOG_FILTER_GLOBAL) {
    return bookable.some((t) => t.is_global);
  }

  if (selection === SERVICES_CATALOG_FILTER_ADDITIONAL) {
    return owned.length > 0;
  }

  const sep = selection.indexOf("__");
  if (sep <= 0) return true;

  const typeId = selection.slice(0, sep);
  const source = selection.slice(sep + 2);

  if (source === "global") {
    return bookable.some((t) => t.id === typeId);
  }

  if (source === "additional") {
    const catalogRow = catalog.find((r) => r.id === typeId && r.source === "additional");
    if (catalogRow?.doctor_offers?.length) {
      return catalogRow.doctor_offers.some((o) => o.id === doctor.id);
    }
    return owned.some((t) => t.id === typeId);
  }

  return true;
}

export function filterDoctorsByServiceCatalog<T extends ServicesDoctorFilterInput>(
  doctors: T[],
  selection: ServicesCatalogFilterState["selection"],
  catalog: ServiceCatalogRow[]
): T[] {
  return doctors.filter((d) => doctorMatchesServiceCatalogSelection(d, selection, catalog));
}
