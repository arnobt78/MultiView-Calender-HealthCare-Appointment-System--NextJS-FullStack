import { describe, expect, it } from "vitest";
import {
  adminUserFormToUpdatePayload,
  EMPTY_ADMIN_USER_FORM,
  userToAdminUserForm,
} from "@/lib/admin-user-form-state";
import type { User } from "@/types/types";

describe("admin-user-form-state", () => {
  it("maps user to form with phone and is_active", () => {
    const user = {
      id: "u1",
      email: "a@b.com",
      display_name: "Demo Admin",
      image: "/img.avif",
      phone: "+1 555",
      is_active: false,
    } as User;

    expect(userToAdminUserForm(user)).toEqual({
      display_name: "Demo Admin",
      image: "/img.avif",
      phone: "+1 555",
      is_active: false,
    });
  });

  it("update payload includes phone and is_active", () => {
    const payload = adminUserFormToUpdatePayload({
      ...EMPTY_ADMIN_USER_FORM,
      display_name: "Name",
      phone: "123",
      is_active: true,
    });
    expect(payload).toEqual({
      display_name: "Name",
      image: null,
      phone: "123",
      is_active: true,
    });
  });
});
