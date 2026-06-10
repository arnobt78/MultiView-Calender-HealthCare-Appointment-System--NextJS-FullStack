import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getCompositeQueryBodyLoadingState,
  getQueryBodyLoadingState,
} from "@/lib/query-body-loading";

describe("getQueryBodyLoadingState", () => {
  it("returns false when cache warm with empty array", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.patients.all, []);
    expect(getQueryBodyLoadingState(qc, queryKeys.patients.all, true)).toBe(false);
  });

  it("returns true when loading and cache cold", () => {
    const qc = new QueryClient();
    expect(getQueryBodyLoadingState(qc, queryKeys.patients.all, true)).toBe(true);
  });

  it("returns false when not loading", () => {
    const qc = new QueryClient();
    expect(getQueryBodyLoadingState(qc, queryKeys.patients.all, false)).toBe(false);
  });
});

describe("getCompositeQueryBodyLoadingState", () => {
  it("requires all keys warm", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.users.all, { users: [], total: 0 });
    expect(
      getCompositeQueryBodyLoadingState(
        qc,
        [queryKeys.users.all, queryKeys.doctors.all],
        true
      )
    ).toBe(true);
  });

  it("returns false when every key warm", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.users.all, { users: [], total: 0 });
    qc.setQueryData(queryKeys.doctors.all, []);
    expect(
      getCompositeQueryBodyLoadingState(
        qc,
        [queryKeys.users.all, queryKeys.doctors.all],
        true
      )
    ).toBe(false);
  });
});
