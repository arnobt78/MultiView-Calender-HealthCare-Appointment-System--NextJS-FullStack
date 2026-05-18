import { queryKeys } from "@/lib/query-keys";

/** Shape at `queryKeys.auth.me` — used for navbar role chrome before async persist rehydrate. */
export type PersistedAuthMe = {
  id: string;
  email: string;
  role?: string;
  display_name?: string;
  image?: string | null;
  email_verified?: boolean;
} | null;

const PERSIST_KEY = "cal-appt-query-cache";
const AUTH_KEY = queryKeys.auth.me;

function matchesAuthMeKey(key: unknown): boolean {
  return (
    Array.isArray(key) &&
    key.length === AUTH_KEY.length &&
    AUTH_KEY.every((part, i) => key[i] === part)
  );
}

/**
 * Synchronous read of `queryKeys.auth.me` from TanStack persist blob in localStorage.
 * Not used for navbar (hydration-safe role comes from `NavRoleContext` / root layout).
 * Kept for optional client-only tooling or future non-SSR consumers.
 */
export function readPersistedAuthMe(): PersistedAuthMe {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      clientState?: { queries?: Array<{ queryKey?: unknown; state?: { data?: unknown } }> };
    };
    const queries = parsed.clientState?.queries ?? [];
    for (const entry of queries) {
      if (matchesAuthMeKey(entry.queryKey)) {
        const data = entry.state?.data;
        if (data && typeof data === "object" && "email" in data) {
          return data as PersistedAuthMe;
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}
