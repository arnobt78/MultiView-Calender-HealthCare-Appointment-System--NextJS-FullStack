import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  applyCrossTabScopes,
  CROSS_TAB_SCOPES,
  publishQueryCacheCrossTab,
  releaseQueryCacheCrossTabBus,
  subscribeQueryCacheCrossTab,
} from "@/lib/query-cache-cross-tab";
import { createQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, value),
  };
}

/** Shared bus so publish + subscribe channels both receive posts (mirrors BroadcastChannel). */
const broadcastBus: Array<{ onmessage: ((event: MessageEvent) => void) | null }> = [];

let mockConstructorCount = 0;
let mockLastInstance: MockBroadcastChannel | null = null;

class MockBroadcastChannel {
  onmessage: ((event: MessageEvent) => void) | null = null;
  readonly name: string;
  postMessageCalls = 0;

  constructor(name: string) {
    this.name = name;
    mockConstructorCount += 1;
    mockLastInstance = this;
    broadcastBus.push(this);
  }

  postMessage(data: unknown) {
    this.postMessageCalls += 1;
    for (const peer of broadcastBus) {
      peer.onmessage?.({ data } as MessageEvent);
    }
  }

  close() {
    const idx = broadcastBus.indexOf(this);
    if (idx >= 0) broadcastBus.splice(idx, 1);
    if (mockLastInstance === this) {
      mockLastInstance = null;
    }
  }

  static resetBus(): void {
    mockConstructorCount = 0;
    mockLastInstance = null;
    broadcastBus.length = 0;
  }
}

describe("applyCrossTabScopes", () => {
  it("marks insights filter variants stale", async () => {
    const qc = createQueryClient();
    const key = queryKeys.insights.filter({ scope: "personal", period: "month" });
    qc.setQueryData(key, { overview: { total: 1 } });

    await applyCrossTabScopes(qc, CROSS_TAB_SCOPES.INSIGHTS_ONLY);

    expect(qc.getQueryState(key)?.isInvalidated).toBe(true);
  });

  it("app scope invalidates entire app tree", async () => {
    const qc = createQueryClient();
    const key = queryKeys.appointments.all;
    qc.setQueryData(key, []);

    await applyCrossTabScopes(qc, CROSS_TAB_SCOPES.APP_ROOT);

    expect(qc.getQueryState(key)?.isInvalidated).toBe(true);
  });

  it("APPOINTMENT_MUTATION scope invalidates patients and categories trees", async () => {
    const qc = createQueryClient();
    const patientSnapKey = queryKeys.patients.snapshot("pat-1");
    const categorySnapKey = queryKeys.categories.snapshot("cat-1");
    qc.setQueryData(patientSnapKey, { patient: { id: "pat-1" }, appointments: [], invoices: [] });
    qc.setQueryData(categorySnapKey, {
      category: { id: "cat-1" },
      appointments: [],
      totalCount: 0,
    });

    await applyCrossTabScopes(qc, CROSS_TAB_SCOPES.APPOINTMENT_MUTATION);

    expect(qc.getQueryState(patientSnapKey)?.isInvalidated).toBe(true);
    expect(qc.getQueryState(categorySnapKey)?.isInvalidated).toBe(true);
    expect(CROSS_TAB_SCOPES.APPOINTMENT_MUTATION).toContain("patients");
    expect(CROSS_TAB_SCOPES.APPOINTMENT_MUTATION).toContain("categories");
  });

  it("ORGANIZATIONS scope includes organizations and dashboard", () => {
    expect(CROSS_TAB_SCOPES.ORGANIZATIONS).toContain("organizations");
    expect(CROSS_TAB_SCOPES.ORGANIZATIONS).toContain("dashboard");
  });
});

describe("publishQueryCacheCrossTab + subscribeQueryCacheCrossTab", () => {
  const originalBroadcastChannel = globalThis.BroadcastChannel;
  const originalWindow = globalThis.window;
  const originalSessionStorage = globalThis.sessionStorage;
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    const session = createMemoryStorage();
    const local = createMemoryStorage();
    vi.stubGlobal("sessionStorage", session);
    vi.stubGlobal("localStorage", local);
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    MockBroadcastChannel.resetBus();
    globalThis.BroadcastChannel =
      MockBroadcastChannel as unknown as typeof BroadcastChannel;
  });

  afterEach(() => {
    releaseQueryCacheCrossTabBus(true);
    MockBroadcastChannel.resetBus();
    if (originalBroadcastChannel) {
      globalThis.BroadcastChannel = originalBroadcastChannel;
    } else {
      // @ts-expect-error restore
      delete globalThis.BroadcastChannel;
    }
    if (originalWindow) {
      vi.stubGlobal("window", originalWindow);
    } else {
      // @ts-expect-error restore
      delete globalThis.window;
    }
    if (originalSessionStorage) {
      vi.stubGlobal("sessionStorage", originalSessionStorage);
    }
    if (originalLocalStorage) {
      vi.stubGlobal("localStorage", originalLocalStorage);
    }
    vi.restoreAllMocks();
  });

  it("reuses one BroadcastChannel for multiple publishes", () => {
    sessionStorage.setItem("cal-appt-query-tab-id", "publisher-tab");

    publishQueryCacheCrossTab(CROSS_TAB_SCOPES.INSIGHTS_ONLY);
    publishQueryCacheCrossTab(CROSS_TAB_SCOPES.INSIGHTS_ONLY);
    publishQueryCacheCrossTab(["dashboard"]);

    expect(mockConstructorCount).toBe(1);
    expect(mockLastInstance?.postMessageCalls).toBe(3);
  });

  it("closes shared channel when last subscriber unsubscribes", () => {
    sessionStorage.setItem("cal-appt-query-tab-id", "listener-tab");

    const cleanup = subscribeQueryCacheCrossTab(() => {});
    expect(mockConstructorCount).toBe(1);

    cleanup();
    expect(mockLastInstance).toBeNull();
    expect(broadcastBus.length).toBe(0);

    publishQueryCacheCrossTab(CROSS_TAB_SCOPES.INSIGHTS_ONLY);
    expect(mockConstructorCount).toBe(2);
  });

  it("ignores messages from the same tabId", async () => {
    const qc = createQueryClient();
    const key = queryKeys.insights.filter({ scope: "organization", period: "all" });
    qc.setQueryData(key, { overview: { total: 2 } });

    subscribeQueryCacheCrossTab((msg) => {
      void applyCrossTabScopes(qc, msg.scopes);
    });

    publishQueryCacheCrossTab(CROSS_TAB_SCOPES.INSIGHTS_ONLY);

    expect(qc.getQueryState(key)?.isInvalidated).toBe(false);
  });

  it("applies scopes from another tab via BroadcastChannel", async () => {
    const qc = createQueryClient();
    const key = queryKeys.insights.filter({ scope: "organization", period: "month" });
    qc.setQueryData(key, { overview: { total: 3 } });

    sessionStorage.setItem("cal-appt-query-tab-id", "listener-tab");

    subscribeQueryCacheCrossTab((msg) => {
      void applyCrossTabScopes(qc, msg.scopes);
    });

    mockLastInstance?.postMessage({
      tabId: "publisher-tab",
      scopes: ["insights", "analytics"],
      ts: Date.now(),
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(qc.getQueryState(key)?.isInvalidated).toBe(true);
  });
});
