import { describe, it, expect } from "vitest";
import {
  createQueryClient,
  getCategoryIdFromAppointmentCache,
  invalidateCategoryDetailAndSnapshot,
  invalidateAfterAppointmentMutation,
} from "@/lib/query-client";
import {
  invalidateAppointmentEntitySnapshots,
  resolveAppointmentMutationTargets,
} from "@/lib/appointment-mutation-invalidation";
import { getCategoryIdFromAppointmentCache as getCategoryFromSharedCache } from "@/lib/appointment-cache-read";
import { queryKeys } from "@/lib/query-keys";

describe("getCategoryIdFromAppointmentCache", () => {
  it("resolves category id from appointments list cache (query-client re-export)", () => {
    const qc = createQueryClient();
    qc.setQueryData(queryKeys.appointments.all, [
      { id: "appt-1", patient: "pat-1", category: "cat-1" },
      { id: "appt-2", patient: "pat-2", category: "cat-2" },
    ]);

    expect(getCategoryIdFromAppointmentCache(qc, "appt-1")).toBe("cat-1");
    expect(getCategoryFromSharedCache(qc, "appt-1")).toBe("cat-1");
    expect(getCategoryIdFromAppointmentCache(qc, "missing")).toBeUndefined();
    expect(getCategoryIdFromAppointmentCache(qc, undefined)).toBeUndefined();
  });
});

describe("resolveAppointmentMutationTargets", () => {
  it("dedupes old and new category ids on reassignment", () => {
    const qc = createQueryClient();
    const targets = resolveAppointmentMutationTargets(qc, {
      categoryId: "cat-new",
      previousCategoryId: "cat-old",
    });
    expect(targets.categoryIds.sort()).toEqual(["cat-new", "cat-old"]);
  });

  it("resolves category from cache via appointmentId when explicit category missing", () => {
    const qc = createQueryClient();
    qc.setQueryData(queryKeys.appointments.all, [
      { id: "appt-del", patient: "pat-1", category: "cat-from-cache" },
    ]);
    const targets = resolveAppointmentMutationTargets(qc, { appointmentId: "appt-del" });
    expect(targets.categoryIds).toEqual(["cat-from-cache"]);
    expect(getCategoryIdFromAppointmentCache(qc, "appt-del")).toBe("cat-from-cache");
  });
});

describe("invalidateCategoryDetailAndSnapshot", () => {
  it("marks category detail and snapshot stale", async () => {
    const qc = createQueryClient();
    const detailKey = queryKeys.categories.detail("cat-1");
    const snapshotKey = queryKeys.categories.snapshot("cat-1");
    qc.setQueryData(detailKey, { id: "cat-1", label: "Cardiology" });
    qc.setQueryData(snapshotKey, { category: { id: "cat-1" }, appointments: [], totalCount: 0 });

    await invalidateCategoryDetailAndSnapshot(qc, "cat-1");

    expect(qc.getQueryState(detailKey)?.isInvalidated).toBe(true);
    expect(qc.getQueryState(snapshotKey)?.isInvalidated).toBe(true);
  });
});

describe("invalidateAppointmentEntitySnapshots bustAllCategorySnapshots", () => {
  it("marks all categories queries stale", async () => {
    const qc = createQueryClient();
    const listKey = queryKeys.categories.all;
    const snapKey = queryKeys.categories.snapshot("cat-bulk");
    qc.setQueryData(listKey, [{ id: "cat-bulk", label: "Bulk" }]);
    qc.setQueryData(snapKey, { category: { id: "cat-bulk" }, appointments: [], totalCount: 0 });

    await invalidateAppointmentEntitySnapshots(qc, {
      patientIds: [],
      categoryIds: [],
      bustAllCategorySnapshots: true,
    });

    expect(qc.getQueryState(listKey)?.isInvalidated).toBe(true);
    expect(qc.getQueryState(snapKey)?.isInvalidated).toBe(true);
  });
});

describe("invalidateAfterAppointmentMutation category wiring", () => {
  it("invalidates category snapshot when categoryId is provided", async () => {
    const qc = createQueryClient();
    const snapshotKey = queryKeys.categories.snapshot("cat-9");
    qc.setQueryData(snapshotKey, { category: { id: "cat-9" }, appointments: [], totalCount: 1 });

    await invalidateAfterAppointmentMutation(qc, { categoryId: "cat-9" });

    expect(qc.getQueryState(snapshotKey)?.isInvalidated).toBe(true);
  });

  it("invalidates both old and new category snapshots on reassignment opts", async () => {
    const qc = createQueryClient();
    const oldKey = queryKeys.categories.snapshot("cat-old");
    const newKey = queryKeys.categories.snapshot("cat-new");
    qc.setQueryData(oldKey, { category: { id: "cat-old" }, appointments: [], totalCount: 1 });
    qc.setQueryData(newKey, { category: { id: "cat-new" }, appointments: [], totalCount: 0 });

    await invalidateAfterAppointmentMutation(qc, {
      categoryId: "cat-new",
      previousCategoryId: "cat-old",
    });

    expect(qc.getQueryState(oldKey)?.isInvalidated).toBe(true);
    expect(qc.getQueryState(newKey)?.isInvalidated).toBe(true);
  });
});
