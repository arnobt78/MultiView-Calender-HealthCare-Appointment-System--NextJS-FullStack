import type { User } from "@/types/types";

/** Admin account edit dialog — role stays admin (doctors/patients use dedicated CP tabs). */
export type AdminUserFormValues = {
  display_name: string;
  image: string;
};

export const EMPTY_ADMIN_USER_FORM: AdminUserFormValues = {
  display_name: "",
  image: "",
};

export function userToAdminUserForm(user: User): AdminUserFormValues {
  return {
    display_name: user.display_name?.trim() ?? "",
    image: user.image?.trim() ?? "",
  };
}

export function adminUserFormToUpdatePayload(form: AdminUserFormValues) {
  return {
    display_name: form.display_name.trim() || null,
    image: form.image.trim() || null,
  };
}
