"use client";

import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useSyncExternalStore, useCallback, useMemo } from "react";
import {
  denormalizeList,
  mergeEntities,
  normalizeList,
  upsertEntity,
  removeEntity,
  type EntityWithId,
  type EntityMap,
} from "@/lib/normalize";

/**
 * Reusable normalized entity store backed by TanStack Query's cache.
 *
 * - Data is stored once per id under `[...baseKey, "__entities"]`.
 * - Components subscribe via `useSyncExternalStore` so changes propagate without
 *   re-running queries.
 * - No extra dependency (no TanStack DB install). Works with the existing QueryClient.
 *
 * Example:
 *   const { entities, upsert, upsertMany, get, remove } = useNormalizedEntities<Patient>(
 *     queryKeys.patients.all,   // tuple constant — no parentheses
 *   );
 *
 *   // After a list fetch:
 *   upsertMany(response.items);
 *
 *   // After a detail fetch / mutation:
 *   upsert(updatedPatient);
 *
 *   // In a component that only needs one:
 *   const patient = get(patientId);
 */
export function useNormalizedEntities<T extends EntityWithId>(baseKey: QueryKey) {
  const queryClient = useQueryClient();
  const storeKey = useMemo<QueryKey>(() => [...baseKey, "__entities"], [baseKey]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const unsub = queryClient.getQueryCache().subscribe((event) => {
        if (!event) return;
        const eventKey = event.query.queryKey;
        if (!Array.isArray(eventKey)) return;
        if (eventKey.length !== storeKey.length) return;
        for (let i = 0; i < storeKey.length; i++) {
          if (eventKey[i] !== storeKey[i]) return;
        }
        onStoreChange();
      });
      return unsub;
    },
    [queryClient, storeKey],
  );

  const getSnapshot = useCallback(
    (): EntityMap<T> => queryClient.getQueryData<EntityMap<T>>(storeKey) ?? (EMPTY_MAP as EntityMap<T>),
    [queryClient, storeKey],
  );

  const getServerSnapshot = useCallback((): EntityMap<T> => EMPTY_MAP as EntityMap<T>, []);

  const entities = useSyncExternalStore<EntityMap<T>>(subscribe, getSnapshot, getServerSnapshot);

  const upsert = useCallback(
    (entity: T) => {
      queryClient.setQueryData<EntityMap<T>>(storeKey, (prev) => upsertEntity(prev ?? {}, entity));
    },
    [queryClient, storeKey],
  );

  const upsertMany = useCallback(
    (items: readonly T[]) => {
      const { entities: next } = normalizeList(items);
      queryClient.setQueryData<EntityMap<T>>(storeKey, (prev) => mergeEntities(prev, next));
    },
    [queryClient, storeKey],
  );

  const remove = useCallback(
    (id: T["id"]) => {
      queryClient.setQueryData<EntityMap<T>>(storeKey, (prev) => removeEntity(prev ?? {}, id));
    },
    [queryClient, storeKey],
  );

  const get = useCallback(
    (id: T["id"]): T | undefined => entities[String(id)],
    [entities],
  );

  const getMany = useCallback(
    (ids: ReadonlyArray<T["id"]>): T[] => denormalizeList(ids, entities),
    [entities],
  );

  return { entities, get, getMany, upsert, upsertMany, remove };
}

const EMPTY_MAP: Readonly<Record<string, unknown>> = Object.freeze({});
