import { describe, expect, it } from "vitest";
import {
  EMPTY_PATIENT_DIALOG_FORM,
  patientToDialogFormState,
} from "@/lib/patient-form-clinical";
import type { Patient } from "@/types/types";

describe("patient-form-clinical", () => {
  it("maps patient.phone into dialog form state and empty defaults", () => {
    const patient = {
      id: "p1",
      firstname: "Ada",
      lastname: "Lovelace",
      email: "ada@example.com",
      phone: "+1 555 0100",
      birth_date: "1815-12-10",
      care_level: 3,
      pronoun: "she/her",
      active: true,
    } as Patient;

    expect(patientToDialogFormState(patient).phone).toBe("+1 555 0100");
    expect(EMPTY_PATIENT_DIALOG_FORM.phone).toBe("");
  });
});
