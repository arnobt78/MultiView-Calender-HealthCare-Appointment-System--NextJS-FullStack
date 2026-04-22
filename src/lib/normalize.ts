/**
 * Lightweight client-side entity normalization utilities for TanStack Query.
 *
 * Idea (Relay / Redux-style): instead of duplicating the same user/patient/doctor
 * object across every list item and detail query, keep one canonical copy per id
 * in a keyed store. Lists only hold ids. When a single entity is updated, every
 * component that consumed it reflects the change without extra refetches.
 *
 * This module is intentionally zero-dependency and tiny — no TanStack DB install
 * required. Use it on top of the existing TanStack Query client.
 *
 * Typical usage:
 *
 *   const { entities, ids } = normalizeList(response.items);
 *   // hand `entities` to the cache keyed by id, store `ids` in the list query
 *
 *   const merged = mergeEntities(prevEntities, entities);
 *   // shallow-merge new entities into an existing store
 */

export type EntityWithId<K extends string | number = string> = { id: K } & Record<string, unknown>;

export type EntityMap<T extends EntityWithId> = Record<string, T>;

export function normalizeList<T extends EntityWithId>(items: readonly T[]): {
  entities: EntityMap<T>;
  ids: Array<T["id"]>;
} {
  const entities: EntityMap<T> = {};
  const ids: Array<T["id"]> = [];

  for (const item of items) {
    if (item == null || item.id == null) continue;
    const key = String(item.id);
    entities[key] = item;
    ids.push(item.id);
  }

  return { entities, ids };
}

export function denormalizeList<T extends EntityWithId>(
  ids: ReadonlyArray<T["id"]>,
  entities: EntityMap<T>,
): T[] {
  const out: T[] = [];
  for (const id of ids) {
    const entity = entities[String(id)];
    if (entity) out.push(entity);
  }
  return out;
}

export function mergeEntities<T extends EntityWithId>(
  prev: EntityMap<T> | undefined,
  next: EntityMap<T>,
): EntityMap<T> {
  if (!prev) return { ...next };
  const merged: EntityMap<T> = { ...prev };
  for (const key in next) {
    const existing = prev[key];
    merged[key] = existing ? { ...existing, ...next[key] } : next[key];
  }
  return merged;
}

export function upsertEntity<T extends EntityWithId>(
  store: EntityMap<T>,
  entity: T,
): EntityMap<T> {
  if (entity == null || entity.id == null) return store;
  const key = String(entity.id);
  const existing = store[key];
  return {
    ...store,
    [key]: existing ? { ...existing, ...entity } : entity,
  };
}

export function removeEntity<T extends EntityWithId>(
  store: EntityMap<T>,
  id: T["id"],
): EntityMap<T> {
  const key = String(id);
  if (!(key in store)) return store;
  const next = { ...store };
  delete next[key];
  return next;
}
