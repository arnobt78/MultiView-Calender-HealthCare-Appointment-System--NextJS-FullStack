import { describe, it, expect } from "vitest";
import { resolveReminderSmsPhone } from "@/lib/reminder-recipient-phone";

describe("resolveReminderSmsPhone", () => {
  it("prefers linked user phone", () => {
    expect(
      resolveReminderSmsPhone({
        patientUser: { phone: "+491701111111" },
        patientRecord: { phone: "+491702222222" },
      })
    ).toBe("+491701111111");
  });

  it("falls back to patient record phone", () => {
    expect(
      resolveReminderSmsPhone({
        patientUser: { phone: null },
        patientRecord: { phone: "+491702222222" },
      })
    ).toBe("+491702222222");
  });

  it("returns null when both missing", () => {
    expect(resolveReminderSmsPhone({ patientUser: null, patientRecord: null })).toBeNull();
  });
});
