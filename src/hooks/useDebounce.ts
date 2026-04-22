import { useEffect, useState } from "react";

/**
 * Debounce a value — not a function. The returned value only updates after
 * `delay` ms of stillness, so components re-render only when the debounced
 * value actually changes.
 *
 * Typical delays used in this project:
 *   300ms — search inputs
 *   500ms — auto-save
 *   150ms — filter dropdowns
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
