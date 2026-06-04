import { describe, expect, it } from "vitest";
import { createQueryClient } from "@/lib/query-client";
import { invalidateDoctorsAffectedByPatientWrite } from "@/lib/entity-snapshot-invalidation";
import { queryKeys } from "@/lib/query-keys";

describe("invalidateDoctorsAffectedByPatientWrite", () => {
  it("marks snapshot and assigned-patients stale for old and new primary doctors", async () => {
    const qc = createQueryClient();
    const oldId = "doc-old";
    const newId = "doc-new";
    const oldSnap = queryKeys.doctors.snapshot(oldId);
    const newSnap = queryKeys.doctors.snapshot(newId);
    const oldRoster = queryKeys.doctors.assignedPatients(oldId);
    qc.setQueryData(oldSnap, { doctor: { id: oldId }, appointments: [], totalCount: 0 });
    qc.setQueryData(newSnap, { doctor: { id: newId }, appointments: [], totalCount: 0 });
    qc.setQueryData(oldRoster, []);

    await invalidateDoctorsAffectedByPatientWrite(qc, {
      primaryDoctorId: newId,
      previousPrimaryDoctorId: oldId,
    });

    expect(qc.getQueryState(oldSnap)?.isInvalidated).toBe(true);
    expect(qc.getQueryState(newSnap)?.isInvalidated).toBe(true);
    expect(qc.getQueryState(oldRoster)?.isInvalidated).toBe(true);
  });
});
