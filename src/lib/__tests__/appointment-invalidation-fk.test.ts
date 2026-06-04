import { describe, expect, it } from "vitest";
import {
  appointmentDoctorFkOpts,
  appointmentDoctorFkOptsWithPrevious,
} from "@/lib/appointment-invalidation-fk";

describe("appointmentDoctorFkOpts", () => {
  it("maps user_id and treating_physician_id", () => {
    expect(
      appointmentDoctorFkOpts({
        user_id: "owner-1",
        treating_physician_id: "treat-2",
      })
    ).toEqual({
      ownerId: "owner-1",
      treatingPhysicianId: "treat-2",
    });
  });
});

describe("appointmentDoctorFkOptsWithPrevious", () => {
  it("merges current and previous FK ids for PATCH invalidation", () => {
    expect(
      appointmentDoctorFkOptsWithPrevious(
        { user_id: "owner-new", treating_physician_id: "treat-new" },
        { user_id: "owner-old", treating_physician_id: "treat-old" }
      )
    ).toEqual({
      ownerId: "owner-new",
      treatingPhysicianId: "treat-new",
      previousOwnerId: "owner-old",
      previousTreatingPhysicianId: "treat-old",
    });
  });

  it("DELETE passes previous row only", () => {
    expect(
      appointmentDoctorFkOptsWithPrevious(null, {
        user_id: "owner-del",
        treating_physician_id: null,
      })
    ).toEqual({
      previousOwnerId: "owner-del",
      previousTreatingPhysicianId: null,
    });
  });
});
