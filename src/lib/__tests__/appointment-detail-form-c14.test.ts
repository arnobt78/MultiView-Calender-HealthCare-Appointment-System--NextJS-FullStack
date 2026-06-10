import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Appointment form must not render inline CRUD — footer owns Save/Delete (C14). */
describe("AppointmentDetailForm C14", () => {
  it("has no inline delete or save button row", () => {
    const src = readFileSync(
      resolve(process.cwd(), "src/components/control-panel/AppointmentDetailForm.tsx"),
      "utf8"
    );
    expect(src).not.toMatch(/variant="destructive"/);
    expect(src).not.toMatch(/Save changes/);
    expect(src).toContain('id={APPOINTMENT_DETAIL_EDIT_FORM_ID}');
  });
});
