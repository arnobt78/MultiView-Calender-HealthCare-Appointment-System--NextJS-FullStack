"use client";

/**
 * Listens for cross-tab invalidation messages and applies scopes to this tab's QueryClient.
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  applyCrossTabScopes,
  subscribeQueryCacheCrossTab,
} from "@/lib/query-cache-cross-tab";

export function useQueryCacheCrossTabSync(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeQueryCacheCrossTab((message) => {
      void applyCrossTabScopes(queryClient, message.scopes);
    });
  }, [queryClient]);
}
