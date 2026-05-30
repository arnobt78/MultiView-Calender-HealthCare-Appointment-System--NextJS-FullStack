import { describe, it, expect, vi } from "vitest";
import { clinicalEmptyOrNode } from "@/components/shared/ClinicalTableEmptyDash";

describe("clinicalEmptyOrNode", () => {
  it("does not evaluate lazy content when value is empty", () => {
    const content = vi.fn(() => "must-not-run");
    const node = clinicalEmptyOrNode(false, content, "table");
    expect(content).not.toHaveBeenCalled();
    expect(node).toBeTruthy();
  });

  it("evaluates lazy content when value is present", () => {
    const node = clinicalEmptyOrNode(true, () => "Room 101", "table");
    expect(node).toBe("Room 101");
  });
});
