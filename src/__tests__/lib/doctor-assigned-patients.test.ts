import { describe, expect, it } from "vitest";
import { serializeDoctorAssignedPatient } from "@/lib/doctor-assigned-patients";

describe("doctor-assigned-patients", () => {
  it("serializeDoctorAssignedPatient maps birth_date to ISO string", () => {
    const row = serializeDoctorAssignedPatient({
      id: "p-1",
      firstname: "Maria",
      lastname: "Schmidt",
      email: "maria@example.com",
      active: true,
      birth_date: new Date("1990-05-15T00:00:00.000Z"),
    });

    expect(row.birth_date).toBe("1990-05-15T00:00:00.000Z");
    expect(row.active).toBe(true);
  });
});
