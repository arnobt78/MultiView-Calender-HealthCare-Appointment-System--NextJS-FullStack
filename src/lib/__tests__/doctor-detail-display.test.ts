import { describe, expect, it } from "vitest";
import { DOCTOR_ASSIGNED_PATIENTS_SUBTITLE } from "@/lib/doctor-detail-display";

describe("DOCTOR_ASSIGNED_PATIENTS_SUBTITLE", () => {
  it("describes primary doctor assignment scope", () => {
    expect(DOCTOR_ASSIGNED_PATIENTS_SUBTITLE).toMatch(/primary/i);
    expect(DOCTOR_ASSIGNED_PATIENTS_SUBTITLE.length).toBeGreaterThan(20);
  });
});
