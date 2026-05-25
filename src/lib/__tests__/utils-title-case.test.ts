import { describe, expect, it } from "vitest";
import { toTitleCaseLabel } from "@/lib/utils";

describe("toTitleCaseLabel", () => {
  it("title-cases parenthetical phrases split across whitespace tokens", () => {
    expect(toTitleCaseLabel("Appointment Types (Global For All Doctors)")).toBe(
      "Appointment Types (Global For All Doctors)"
    );
  });
});
