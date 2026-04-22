"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * One-line abort pattern for fetches inside effects / handlers.
 *
 * `getSignal()`:
 *   1. Aborts any in-flight request from the previous call
 *   2. Creates a fresh AbortController
 *   3. Returns the new signal
 *
 * The cleanup effect also aborts on unmount, so you never get state updates on
 * unmounted components or race conditions on fast navigation.
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  const getSignal = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }, []);

  const abort = useCallback((reason?: string) => {
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      controllerRef.current.abort(reason);
    }
  }, []);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return { getSignal, abort };
}
