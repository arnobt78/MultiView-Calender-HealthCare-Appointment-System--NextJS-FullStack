import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  beginAuthNavigation,
  consumePostLoginToastIfArrived,
  consumePostLogoutToastIfArrived,
  clearAuthNavPendingIfArrived,
  isAuthBarePath,
  isAuthNavPendingForPath,
  setAuthNavPending,
  setPostLoginToast,
  setPostLogoutToast,
  shouldRunAuthenticatedAppQueries,
} from "@/lib/auth-pending-toast";

function createStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

describe("auth-pending-toast", () => {
  const originalSessionStorage = globalThis.sessionStorage;
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    vi.stubGlobal("sessionStorage", createStorage());
    vi.stubGlobal("localStorage", createStorage());
  });

  afterEach(() => {
    if (originalSessionStorage) {
      vi.stubGlobal("sessionStorage", originalSessionStorage);
    }
    if (originalLocalStorage) {
      vi.stubGlobal("localStorage", originalLocalStorage);
    }
  });

  it("isAuthBarePath covers public entry routes", () => {
    expect(isAuthBarePath("/")).toBe(true);
    expect(isAuthBarePath("/login")).toBe(true);
    expect(isAuthBarePath("/control-panel/dashboard-overview")).toBe(false);
  });

  it("defers login welcome until destination pathname", () => {
    setPostLoginToast({ name: "Demo Admin", todayCount: 0, dest: "/control-panel/dashboard-overview" });

    expect(consumePostLoginToastIfArrived("/")).toBeNull();
    expect(sessionStorage.getItem("post-login-toast")).toBeTruthy();

    const consumed = consumePostLoginToastIfArrived("/control-panel/dashboard-overview");
    expect(consumed).toEqual({
      name: "Demo Admin",
      todayCount: 0,
      dest: "/control-panel/dashboard-overview",
    });
    expect(sessionStorage.getItem("post-login-toast")).toBeNull();
  });

  it("shows logout goodbye only on /login", () => {
    setPostLogoutToast({ name: "Alex" });

    expect(consumePostLogoutToastIfArrived("/")).toBeNull();
    expect(consumePostLogoutToastIfArrived("/dashboard")).toBeNull();

    expect(consumePostLogoutToastIfArrived("/login")).toEqual({ name: "Alex" });
  });

  it("restores button loading flag across remounts", () => {
    setAuthNavPending("/", "/control-panel/dashboard-overview");
    expect(isAuthNavPendingForPath("/")).toBe(true);
    expect(isAuthNavPendingForPath("/login")).toBe(false);
    clearAuthNavPendingIfArrived("/control-panel/dashboard-overview");
    expect(isAuthNavPendingForPath("/")).toBe(false);
  });

  it("shouldRunAuthenticatedAppQueries blocks bare auth paths", () => {
    expect(shouldRunAuthenticatedAppQueries("/")).toBe(false);
    expect(shouldRunAuthenticatedAppQueries("/login")).toBe(false);
    expect(shouldRunAuthenticatedAppQueries("/control-panel/dashboard-overview")).toBe(true);
  });

  it("beginAuthNavigation skips replace on double-fire for same from+dest", () => {
    const replace = vi.fn();
    vi.stubGlobal("window", { location: { replace } });

    // First call — sets pending, fires replace.
    beginAuthNavigation("/login", "/control-panel/dashboard-overview");
    expect(replace).toHaveBeenCalledTimes(1);
    expect(isAuthNavPendingForPath("/login")).toBe(true);

    // Second call with same from+dest — already pending, replace must not fire again.
    beginAuthNavigation("/login", "/control-panel/dashboard-overview");
    expect(replace).toHaveBeenCalledTimes(1);

    // Different dest — new navigation fires.
    beginAuthNavigation("/login", "/doctor-portal");
    expect(replace).toHaveBeenCalledTimes(2);
  });
});
