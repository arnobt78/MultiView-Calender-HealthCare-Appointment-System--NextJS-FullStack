import { useEffect, useRef } from "react";

/**
 * Returns the value from the previous render (undefined on first render).
 * Uses a ref so storing the value never causes a re-render.
 *
 * The ref read is intentional: this hook purposefully returns the prior commit's
 * value. The effect writes after render, so the next render reads the now-previous.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // eslint-disable-next-line react-hooks/refs -- intentional: returning previous commit's value
  return ref.current;
}
