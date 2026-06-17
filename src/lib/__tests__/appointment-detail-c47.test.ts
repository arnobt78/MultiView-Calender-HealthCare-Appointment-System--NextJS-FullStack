import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** C47 — appointment detail header quick actions + telehealth video gate. */
describe("appointment detail C47", () => {
  it("header includes quick actions beside back", () => {
    const src = readFileSync(
      resolve(
        process.cwd(),
        "src/components/shared/appointment-detail/AppointmentDetailScreenShared.tsx"
      ),
      "utf8"
    );
    expect(src).toContain("AppointmentDetailHeaderQuickActions");
  });

  it("header quick actions gate video on is_telehealth", () => {
    const src = readFileSync(
      resolve(
        process.cwd(),
        "src/components/shared/appointment-detail/AppointmentDetailHeaderQuickActions.tsx"
      ),
      "utf8"
    );
    expect(src).toContain("appointment.is_telehealth");
    expect(src).toContain("Mark Done");
  });

  it("action bar has Edit Invoice and no footer VideoCall", () => {
    const src = readFileSync(
      resolve(
        process.cwd(),
        "src/components/shared/appointment-detail/AppointmentDetailActionBar.tsx"
      ),
      "utf8"
    );
    expect(src).toContain("Edit Invoice");
    expect(src).not.toContain("VideoCall");
    expect(src).not.toContain('Mark Done"');
  });

  it("seeds billing appointment options from detail", () => {
    const src = readFileSync(
      resolve(
        process.cwd(),
        "src/components/shared/appointment-detail/AppointmentDetailScreenShared.tsx"
      ),
      "utf8"
    );
    expect(src).toContain("mapAppointmentDetailToBillingOption");
    expect(src).toContain("seedBillingAppointmentOptionsCache");
  });
});
