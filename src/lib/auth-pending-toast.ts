/**
 * Deferred auth toasts — stored before navigation, consumed only after the user
 * arrives on the destination route (never on bare landing/login/register pages).
 */

export type PostLoginToastPayload = {
  name: string;
  todayCount: number;
  /** Role home path from resolveRoleHomeHref — toast fires when pathname matches. */
  dest: string;
};

export type PostLogoutToastPayload = {
  name: string;
};

const POST_LOGIN_KEY = "post-login-toast";
const POST_LOGOUT_KEY = "post-logout-toast";
/** Survives remounts during auth navigation so button spinners never drop mid-transition. */
const AUTH_NAV_PENDING_KEY = "auth-nav-pending";

export type AuthNavPendingPayload = {
  from: string;
  dest: string;
  startedAt: number;
};

/** Public auth entry routes — welcome toast must not fire here. */
export const AUTH_BARE_PATHS = ["/", "/login", "/register", "/accept-invitation"] as const;

export function isAuthBarePath(pathname: string): boolean {
  return AUTH_BARE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/** Dashboard/calendar queries must not run on public auth entry pages (pre-login prefetch flash). */
export function shouldRunAuthenticatedAppQueries(pathname: string): boolean {
  return !isAuthBarePath(pathname);
}

function pathnameMatchesDest(pathname: string, dest: string): boolean {
  const normalized = dest.trim();
  if (!normalized) return false;
  return pathname === normalized || pathname.startsWith(`${normalized}/`);
}

export function setPostLoginToast(payload: PostLoginToastPayload): void {
  const serialized = JSON.stringify(payload);
  sessionStorage.setItem(POST_LOGIN_KEY, serialized);
  localStorage.setItem(POST_LOGIN_KEY, serialized);
}

export function setPostLogoutToast(payload: PostLogoutToastPayload): void {
  const serialized = JSON.stringify(payload);
  sessionStorage.setItem(POST_LOGOUT_KEY, serialized);
  localStorage.setItem(POST_LOGOUT_KEY, serialized);
}

/** Returns payload and clears storage when the user has arrived on the role home. */
export function consumePostLoginToastIfArrived(
  pathname: string
): PostLoginToastPayload | null {
  if (isAuthBarePath(pathname)) return null;

  const raw =
    sessionStorage.getItem(POST_LOGIN_KEY) || localStorage.getItem(POST_LOGIN_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PostLoginToastPayload>;
    const dest = parsed.dest?.trim();
    if (!dest || !pathnameMatchesDest(pathname, dest)) return null;

    sessionStorage.removeItem(POST_LOGIN_KEY);
    localStorage.removeItem(POST_LOGIN_KEY);

    return {
      name: parsed.name?.trim() || "there",
      todayCount: Number(parsed.todayCount ?? 0),
      dest,
    };
  } catch {
    sessionStorage.removeItem(POST_LOGIN_KEY);
    localStorage.removeItem(POST_LOGIN_KEY);
    return null;
  }
}

/** Goodbye toast only after logout redirect lands on /login. */
export function consumePostLogoutToastIfArrived(
  pathname: string
): PostLogoutToastPayload | null {
  if (pathname !== "/login") return null;

  const raw =
    sessionStorage.getItem(POST_LOGOUT_KEY) || localStorage.getItem(POST_LOGOUT_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(POST_LOGOUT_KEY);
  localStorage.removeItem(POST_LOGOUT_KEY);

  try {
    const parsed = JSON.parse(raw) as Partial<PostLogoutToastPayload>;
    return { name: parsed.name?.trim() || "there" };
  } catch {
    return { name: "there" };
  }
}

function readAuthNavPending(): AuthNavPendingPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(AUTH_NAV_PENDING_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthNavPendingPayload>;
    const from = parsed.from?.trim();
    const dest = parsed.dest?.trim();
    if (!from || !dest) return null;
    return { from, dest, startedAt: Number(parsed.startedAt ?? Date.now()) };
  } catch {
    sessionStorage.removeItem(AUTH_NAV_PENDING_KEY);
    return null;
  }
}

/** Call before navigation — keeps button spinner through remounts / dev recompiles. */
export function setAuthNavPending(from: string, dest: string): void {
  const payload: AuthNavPendingPayload = { from, dest, startedAt: Date.now() };
  sessionStorage.setItem(AUTH_NAV_PENDING_KEY, JSON.stringify(payload));
}

export function clearAuthNavPending(): void {
  sessionStorage.removeItem(AUTH_NAV_PENDING_KEY);
}

/** Sync read for useState initializer — true when this page is mid-auth navigation. */
export function isAuthNavPendingForPath(pathname: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  const pending = readAuthNavPending();
  if (!pending) return false;
  return pending.from === pathname;
}

/** Mark auth navigation complete once the role home route is active. */
export function clearAuthNavPendingIfArrived(pathname: string): void {
  const pending = readAuthNavPending();
  if (!pending) return;
  if (pathnameMatchesDest(pathname, pending.dest)) {
    clearAuthNavPending();
  }
}

/**
 * Hard replace — avoids soft-nav refetch of /login with auth cookie (proxy redirect flash).
 * Guard: if already in-flight for exact same from+dest, skip (handles React Strict Mode
 * double-invoke without blocking legitimate single-click navigation).
 */
export function beginAuthNavigation(from: string, dest: string): void {
  const existing = readAuthNavPending();
  if (existing?.from === from && existing?.dest === dest) return;

  setAuthNavPending(from, dest);
  window.location.replace(dest);
}
