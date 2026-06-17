import { describe, expect, it } from "vitest";
import type { DoctorPrefetchRow } from "@/lib/server-prefetch";

/** Shape contract — prefetchDoctors map must include office_location for dialog prefill. */
describe("DoctorPrefetchRow office_location", () => {
  it("includes office_location for location prefill on doctor pick", () => {
    const row: DoctorPrefetchRow = {
      id: "d1",
      email: "doc@test.com",
      display_name: "Dr A",
      image: null,
      specialty: "GP",
      bio: null,
      role: "doctor",
      created_at: new Date().toISOString(),
      availabilities: [],
      appointment_types: [],
      bookable_appointment_types: [],
      patient_count: 0,
      office_location: "Room 101, Block A",
    };
    expect(row.office_location).toBe("Room 101, Block A");
  });
});
