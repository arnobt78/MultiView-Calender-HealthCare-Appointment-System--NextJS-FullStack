import { describe, expect, it } from "vitest";
import {
  appointmentMatchesClinicalRoleFilter,
  CALENDAR_CLINICAL_ROLE_ALL,
  CALENDAR_CLINICAL_ROLE_OWNER,
  CALENDAR_CLINICAL_ROLE_TREATING,
} from "@/lib/calendar-clinical-role-filter";

describe("calendar-clinical-role-filter", () => {
  const me = "doc-me";
  const other = "doc-other";

  it("all passes every row", () => {
    expect(
      appointmentMatchesClinicalRoleFilter(
        { user_id: other, treating_physician_id: me },
        me,
        CALENDAR_CLINICAL_ROLE_ALL
      )
    ).toBe(true);
  });

  it("calendar_owner requires user_id match", () => {
    expect(
      appointmentMatchesClinicalRoleFilter(
        { user_id: me, treating_physician_id: other },
        me,
        CALENDAR_CLINICAL_ROLE_OWNER
      )
    ).toBe(true);
    expect(
      appointmentMatchesClinicalRoleFilter(
        { user_id: other, treating_physician_id: me },
        me,
        CALENDAR_CLINICAL_ROLE_OWNER
      )
    ).toBe(false);
  });

  it("treating_referred requires explicit treating id and different owner", () => {
    expect(
      appointmentMatchesClinicalRoleFilter(
        { user_id: other, treating_physician_id: me },
        me,
        CALENDAR_CLINICAL_ROLE_TREATING
      )
    ).toBe(true);
    expect(
      appointmentMatchesClinicalRoleFilter(
        { user_id: me, treating_physician_id: me },
        me,
        CALENDAR_CLINICAL_ROLE_TREATING
      )
    ).toBe(false);
    expect(
      appointmentMatchesClinicalRoleFilter(
        { user_id: other, treating_physician_id: null },
        me,
        CALENDAR_CLINICAL_ROLE_TREATING
      )
    ).toBe(false);
  });
});
