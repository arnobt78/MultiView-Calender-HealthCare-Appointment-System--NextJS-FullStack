import { describe, it, expect } from "vitest";
import { canCancelAppointment } from "@/lib/appointment-cancel-access";

const baseRow = {
  owner_id: "owner-1",
  treating_physician_id: "tp-1" as string | null,
  assignees: [] as {
    user_id: string | null;
    invited_email: string | null;
    status: string | null;
    permission: string | null;
  }[],
};

describe("canCancelAppointment", () => {
  it("denies patients", () => {
    expect(
      canCancelAppointment(
        { userId: "p1", email: "p@test.com", role: "patient" },
        baseRow
      )
    ).toBe(false);
  });

  it("allows admin without owner/assignee", () => {
    expect(
      canCancelAppointment(
        { userId: "admin-1", email: "a@test.com", role: "admin" },
        baseRow
      )
    ).toBe(true);
  });

  it("allows calendar owner", () => {
    expect(
      canCancelAppointment(
        { userId: "owner-1", email: "o@test.com", role: "doctor" },
        { ...baseRow, treating_physician_id: null }
      )
    ).toBe(true);
  });

  it("allows treating physician", () => {
    expect(
      canCancelAppointment(
        { userId: "tp-1", email: "tp@test.com", role: "doctor" },
        baseRow
      )
    ).toBe(true);
  });

  it("allows write assignee", () => {
    expect(
      canCancelAppointment(
        { userId: "w-1", email: "w@test.com", role: "doctor" },
        {
          ...baseRow,
          assignees: [
            {
              user_id: "w-1",
              invited_email: null,
              status: "accepted",
              permission: "write",
            },
          ],
        }
      )
    ).toBe(true);
  });

  it("denies read assignee", () => {
    expect(
      canCancelAppointment(
        { userId: "r-1", email: "r@test.com", role: "doctor" },
        {
          ...baseRow,
          assignees: [
            {
              user_id: "r-1",
              invited_email: null,
              status: "accepted",
              permission: "read",
            },
          ],
        }
      )
    ).toBe(false);
  });
});
