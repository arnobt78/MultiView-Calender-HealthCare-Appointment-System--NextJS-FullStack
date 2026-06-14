import { describe, expect, it } from "vitest";
import { toSentenceCaseSubtitle, toTitleCaseLabel } from "@/lib/utils";

describe("toTitleCaseLabel", () => {
  it("title-cases parenthetical phrases split across whitespace tokens", () => {
    expect(toTitleCaseLabel("Appointment Types (Global For All Doctors)")).toBe(
      "Appointment Types (Global For All Doctors)"
    );
  });

  it("preserves `.ics` file extension spelling in titles", () => {
    expect(toTitleCaseLabel("Import external appointments")).toBe("Import External Appointments");
    expect(toTitleCaseLabel("Export appointments")).toBe("Export Appointments");
    expect(toTitleCaseLabel("Import with treating physician")).toBe(
      "Import With Treating Physician"
    );
    expect(toTitleCaseLabel("Import .ics")).toBe("Import .ics");
    expect(toTitleCaseLabel("Choose .ics file")).toBe("Choose .ics File");
  });
});

describe("toSentenceCaseSubtitle", () => {
  it("capitalizes only the first character", () => {
    expect(toSentenceCaseSubtitle("paid in selected period ($)")).toBe(
      "Paid in selected period ($)"
    );
    expect(toSentenceCaseSubtitle("Mon–Sun window")).toBe("Mon–Sun window");
  });
});
