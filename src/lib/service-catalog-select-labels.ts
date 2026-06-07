import type { ServiceCatalogRow } from "@/lib/appointment-service-catalog";
import { appointmentTypeIconOptionLabel } from "@/lib/appointment-type-icon-options";
import { resolveServiceCatalogVisual } from "@/lib/service-catalog-visual";
import { toTitleCaseLabel } from "@/lib/utils";

/** Dropdown row — icon category + visit name + duration. */
export function serviceCatalogSelectOptionLabel(service: ServiceCatalogRow): string {
  const visual = resolveServiceCatalogVisual(service);
  const category = appointmentTypeIconOptionLabel(visual.iconName);
  return toTitleCaseLabel(`${category} · ${service.name} · ${service.duration_minutes} min`);
}
