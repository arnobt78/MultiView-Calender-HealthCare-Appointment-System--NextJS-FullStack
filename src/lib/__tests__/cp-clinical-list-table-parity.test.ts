import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "src/components/control-panel");

/** Regression: CP entity lists share column + inner table frame tokens. */
const LIST_FILES = [
  "PatientManagement.tsx",
  "UserManagement.tsx",
  "DoctorManagement.tsx",
  "CategoryManagement.tsx",
] as const;

describe("cp clinical list table parity across CP entity lists", () => {
  it.each(LIST_FILES)("%s uses shared inner table frame token", (file) => {
    const src = readFileSync(join(ROOT, file), "utf8");
    expect(src).toContain("cpClinicalListTableFrameClassName");
  });

  it.each([
    "PatientManagement.tsx",
    "UserManagement.tsx",
    "DoctorManagement.tsx",
    "CategoryManagement.tsx",
  ] as const)("%s uses shared actions column shell", (file) => {
    const src = readFileSync(join(ROOT, file), "utf8");
    expect(src).toContain("cpClinicalListActionsColumnShellClass");
  });

  it("doctor management no longer crushes actions with w-[1%]", () => {
    const src = readFileSync(join(ROOT, "DoctorManagement.tsx"), "utf8");
    expect(src).not.toMatch(/shellClassName:\s*"w-\[1%\]/);
  });
});
