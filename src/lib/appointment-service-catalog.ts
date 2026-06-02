/**
 * Unified services catalog for `/services` — global visit types plus doctor-owned types.
 * Additional rows are deduplicated by normalized name across doctors.
 */

export type ServiceCatalogSource = "global" | "additional";

/** Doctor who offers a deduped additional visit type (for links + specialty badge on /services). */
export type ServiceCatalogDoctorOffer = {
  id: string;
  label: string;
  specialty: string | null;
};

export type ServiceCatalogRow = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  is_telehealth: boolean;
  /** Visit fee in cents — 0 = no price set. */
  price_cents: number;
  source: ServiceCatalogSource;
  /** Present when source === "additional" — owners after name dedupe. */
  doctor_offers?: ServiceCatalogDoctorOffer[];
};

/** Raw global row from Prisma / API. */
export type GlobalCatalogInput = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  is_telehealth: boolean;
  price_cents: number;
};

/** Raw doctor-owned row with owner display fields. */
export type AdditionalCatalogInput = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  is_telehealth: boolean;
  price_cents: number;
  user_id: string;
  owner_display_name: string | null;
  owner_email: string;
  owner_specialty: string | null;
};

export type ServicesCatalogFilterState = {
  /** `all` | source bucket | single row via `${id}__${source}` */
  selection: string;
};

export const SERVICES_CATALOG_FILTER_ALL = "__all__";
export const SERVICES_CATALOG_FILTER_GLOBAL = "__global__";
export const SERVICES_CATALOG_FILTER_ADDITIONAL = "__additional__";

export function serviceCatalogFilterValue(id: string, source: ServiceCatalogSource): string {
  return `${id}__${source}`;
}

function ownerLabel(displayName: string | null, email: string): string {
  const n = displayName?.trim();
  if (n) return n;
  return email.trim() || "Doctor";
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Builds the public services list: globals 1:1; additionals merged by name (case-insensitive).
 * Representative row per group: lowest duration, then name.
 */
export function buildServiceCatalog(
  globalRows: GlobalCatalogInput[],
  additionalRows: AdditionalCatalogInput[]
): ServiceCatalogRow[] {
  const globals: ServiceCatalogRow[] = globalRows.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    duration_minutes: g.duration_minutes,
    buffer_before_minutes: g.buffer_before_minutes,
    buffer_after_minutes: g.buffer_after_minutes,
    slot_interval_minutes: g.slot_interval_minutes,
    is_telehealth: g.is_telehealth,
    price_cents: g.price_cents,
    source: "global",
  }));

  const byName = new Map<
    string,
    { rep: AdditionalCatalogInput; owners: Map<string, ServiceCatalogDoctorOffer> }
  >();

  for (const row of additionalRows) {
    const key = normalizeName(row.name);
    const label = ownerLabel(row.owner_display_name, row.owner_email);
    const offer: ServiceCatalogDoctorOffer = {
      id: row.user_id,
      label,
      specialty: row.owner_specialty,
    };
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, { rep: row, owners: new Map([[row.user_id, offer]]) });
      continue;
    }
    existing.owners.set(row.user_id, offer);
    const a = existing.rep;
    if (
      row.duration_minutes < a.duration_minutes ||
      (row.duration_minutes === a.duration_minutes && row.name.localeCompare(a.name) < 0)
    ) {
      existing.rep = row;
    }
  }

  const additionals: ServiceCatalogRow[] = Array.from(byName.values()).map(({ rep, owners }) => {
    const doctor_offers = Array.from(owners.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
    return {
      id: rep.id,
      name: rep.name,
      description: rep.description,
      duration_minutes: rep.duration_minutes,
      buffer_before_minutes: rep.buffer_before_minutes,
      buffer_after_minutes: rep.buffer_after_minutes,
      slot_interval_minutes: rep.slot_interval_minutes,
      is_telehealth: rep.is_telehealth,
      price_cents: rep.price_cents,
      source: "additional" as const,
      doctor_offers,
    };
  });

  return [...globals, ...additionals].sort((a, b) => {
    if (a.source !== b.source) return a.source === "global" ? -1 : 1;
    return (
      a.duration_minutes - b.duration_minutes || a.name.localeCompare(b.name)
    );
  });
}

export function filterServiceCatalog(
  rows: ServiceCatalogRow[],
  filter: ServicesCatalogFilterState
): ServiceCatalogRow[] {
  const sel = filter.selection;
  if (sel === SERVICES_CATALOG_FILTER_ALL) return rows;
  if (sel === SERVICES_CATALOG_FILTER_GLOBAL) {
    return rows.filter((r) => r.source === "global");
  }
  if (sel === SERVICES_CATALOG_FILTER_ADDITIONAL) {
    return rows.filter((r) => r.source === "additional");
  }
  const sep = sel.indexOf("__");
  if (sep > 0) {
    const id = sel.slice(0, sep);
    const source = sel.slice(sep + 2) as ServiceCatalogSource;
    return rows.filter((r) => r.id === id && r.source === source);
  }
  return rows;
}

export const defaultServicesCatalogFilter = (): ServicesCatalogFilterState => ({
  selection: SERVICES_CATALOG_FILTER_ALL,
});
