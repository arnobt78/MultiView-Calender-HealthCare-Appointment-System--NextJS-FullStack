import { describe, expect, it } from "vitest";
import {
  cpClinicalListActionsColumnShellClass,
  cpClinicalListIdentityColumnShellClass,
  cpClinicalListJoinedColumnShellClass,
  cpClinicalListPhoneColumnShellClass,
  cpClinicalListTableFrameClassName,
} from "@/lib/cp-clinical-list-table-classes";

describe("cp-clinical-list-table-classes C17", () => {
  it("exports table frame token", () => {
    expect(cpClinicalListTableFrameClassName).toContain("border-0");
  });

  it("exports joined column shell with min width (no w-1% crush)", () => {
    expect(cpClinicalListJoinedColumnShellClass).toContain("w-[13.5%]");
    expect(cpClinicalListJoinedColumnShellClass).toContain("min-w-[9rem]");
    expect(cpClinicalListJoinedColumnShellClass).not.toContain("w-[1%]");
  });

  it("exports actions column shell right-aligned", () => {
    expect(cpClinicalListActionsColumnShellClass).toContain("w-[8%]");
    expect(cpClinicalListActionsColumnShellClass).toContain("text-right");
    expect(cpClinicalListActionsColumnShellClass).not.toContain("w-[1%]");
  });

  it("exports identity and phone column shells", () => {
    expect(cpClinicalListIdentityColumnShellClass).toContain("w-[22%]");
    expect(cpClinicalListPhoneColumnShellClass).toContain("w-[12%]");
  });

  it("inner frame is transparent (outer glow from ControlPanelEntityListShell)", () => {
    expect(cpClinicalListTableFrameClassName).toContain("rounded-none");
    expect(cpClinicalListTableFrameClassName).toContain("bg-transparent");
  });
});
