import { describe, expect, it } from "vitest";
import {
  partitionTelehealthTypesForDoctorFromApi,
  resolveDefaultTelehealthTypeId,
} from "@/lib/telehealth-scheduling-types";
import type { AppointmentTypeDoctorApiRow } from "@/lib/doctor-bookable-types";

const DOCTOR = "11111111-1111-4111-8111-111111111111";

function row(
  partial: Partial<AppointmentTypeDoctorApiRow> & Pick<AppointmentTypeDoctorApiRow, "id" | "name">
): AppointmentTypeDoctorApiRow {
  return {
    user_id: null,
    duration_minutes: 30,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    slot_interval_minutes: 30,
    is_telehealth: true,
    is_enabled: true,
    is_active: true,
    ...partial,
  };
}

describe("partitionTelehealthTypesForDoctorFromApi", () => {
  it("keeps only telehealth rows and splits enabled vs disabled", () => {
    const types = [
      row({ id: "a", name: "In Person", is_telehealth: false }),
      row({ id: "b", name: "Video Visit", is_enabled: true }),
      row({ id: "c", name: "Disabled Video", is_enabled: false }),
      row({
        id: "d",
        name: "Owned Tele",
        user_id: DOCTOR,
        is_active: false,
      }),
    ];

    const { selectable, inactiveDisplay } = partitionTelehealthTypesForDoctorFromApi(
      DOCTOR,
      types
    );

    expect(selectable.map((t) => t.id)).toEqual(["b"]);
    expect(inactiveDisplay.map((t) => t.id)).toEqual(["c", "d"]);
  });

  it("sorts selectable and inactive by name", () => {
    const types = [
      row({ id: "z", name: "Zed Video", is_enabled: false }),
      row({ id: "a", name: "Alpha Video", is_enabled: true }),
    ];
    const { selectable, inactiveDisplay } = partitionTelehealthTypesForDoctorFromApi(
      DOCTOR,
      types
    );
    expect(selectable[0]?.name).toBe("Alpha Video");
    expect(inactiveDisplay[0]?.name).toBe("Zed Video");
  });
});

describe("resolveDefaultTelehealthTypeId", () => {
  it("returns first selectable id or empty string", () => {
    expect(resolveDefaultTelehealthTypeId([])).toBe("");
    expect(resolveDefaultTelehealthTypeId([row({ id: "x", name: "Video" })])).toBe("x");
  });
});
