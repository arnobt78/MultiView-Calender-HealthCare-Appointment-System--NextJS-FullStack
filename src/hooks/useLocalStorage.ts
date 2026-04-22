"use client";

import { useCallback, useEffect, useState } from "react";

type SetValue<T> = T | ((prev: T) => T);

/**
 * State that survives refresh — SSR-safe and hydration-safe.
 *
 * Returns `[value, setValue, remove]`:
 * - Starts as `initialValue` so the server and first client render match (no hydration mismatch).
 * - Reads from `localStorage` on mount; if a stored value exists it updates state.
 * - Writes to `localStorage` on every change.
 * - `remove()` resets to `initialValue` and clears the key.
 * - Cross-tab sync via the `storage` event.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional SSR hydration read
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // invalid JSON — keep initialValue
    }
  }, [key]);

  const setValue = useCallback(
    (value: SetValue<T>) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(key, JSON.stringify(next));
          } catch {
            console.warn(`Failed to save "${key}" to localStorage`);
          }
        }
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    setStoredValue(initialValue);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  }, [key, initialValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key || event.newValue === null) return;
      try {
        setStoredValue(JSON.parse(event.newValue) as T);
      } catch {
        // ignore malformed external writes
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [storedValue, setValue, remove];
}
