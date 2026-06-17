import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** C44 — past edit slots show selected styling while remaining disabled. */
describe("SchedulingSlotChipGrid C44", () => {
  it("applies selected class on non-selectable past cells", () => {
    const src = readFileSync(
      resolve(process.cwd(), "src/components/shared/scheduling/SchedulingSlotChipGrid.tsx"),
      "utf8"
    );
    expect(src).toContain("schedulingSlotChipSelectedClass");
    expect(src).toContain("muted={!selectable && !selected}");
    expect(src).toMatch(/selected\s*\?/);
    expect(src).not.toMatch(/selectable\s*&&\s*\(selected\s*\?/);
  });
});
