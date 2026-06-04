import { describe, expect, it } from "vitest";
import { resolvePortalTreatingClinician } from "@/lib/portal-appointment-clinician";

describe("resolvePortalTreatingClinician", () => {
  it("returns treating_physician when set", () => {
    const treating = {
      id: "d1",
      display_name: "Dr. A",
      email: "a@test.com",
      role: "doctor",
      image: null,
      specialty: "GP",
    };
    expect(
      resolvePortalTreatingClinician({
        treating_physician: treating,
        treating_physician_id: "d1",
        user_id: "d2",
        owner: undefined,
      })
    ).toBe(treating);
  });

  it("falls back to owner when treating id matches owner", () => {
    const owner = {
      id: "d1",
      display_name: "Dr. Demo",
      email: "doc@test.com",
      role: "doctor",
      image: null,
      specialty: "Internal Medicine",
    };
    expect(
      resolvePortalTreatingClinician({
        treating_physician: undefined,
        treating_physician_id: "d1",
        user_id: "d1",
        owner,
      })
    ).toBe(owner);
  });
});
