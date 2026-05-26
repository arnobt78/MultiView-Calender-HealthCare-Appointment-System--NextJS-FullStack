import { describe, expect, it } from "vitest";
import { toSentenceCaseSubtitle, toTitleCaseLabel } from "@/lib/utils";

describe("toTitleCaseLabel", () => {
  it("title-cases parenthetical phrases split across whitespace tokens", () => {
    expect(toTitleCaseLabel("Appointment Types (Global For All Doctors)")).toBe(
      "Appointment Types (Global For All Doctors)"
    );
  });

  it("title-cases multi-word stat and section labels", () => {
    expect(toTitleCaseLabel("avg duration")).toBe("Avg Duration");
    expect(toTitleCaseLabel("this week")).toBe("This Week");
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
