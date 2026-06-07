"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

const DEFAULT_RESET_MS = 2000;

type Options = {
  /** How long the “copied” check icon stays visible (default 2000ms). */
  resetMs?: number;
};

/**
 * Local clipboard feedback — no server/cache side effects.
 * Resets `copied` after `resetMs` so the Copy icon returns automatically.
 */
export function useCopyToClipboard(options: Options = {}) {
  const resetMs = options.resetMs ?? DEFAULT_RESET_MS;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const copy = useCallback(
    async (text: string) => {
      clearTimer();
      const ok = await copyTextToClipboard(text);
      if (!ok) {
        setCopied(false);
        return false;
      }
      setCopied(true);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, resetMs);
      return true;
    },
    [clearTimer, resetMs]
  );

  return { copied, copy };
}
