import type { User } from "@/types/types";

/** Admin account edit/create dialog — B2B fields only (no doctor specialty/license). */
export type AdminUserFormValues = {
  display_name: string;
  image: string;
  phone: string;
  is_active: boolean;
};

export const EMPTY_ADMIN_USER_FORM: AdminUserFormValues = {
  display_name: "",
  image: "",
  phone: "",
  is_active: true,
};

export function userToAdminUserForm(user: User): AdminUserFormValues {
  return {
    display_name: user.display_name?.trim() ?? "",
    image: user.image?.trim() ?? "",
    phone: user.phone?.trim() ?? "",
    is_active: user.is_active !== false,
  };
}

export function adminUserFormToUpdatePayload(form: AdminUserFormValues) {
  return {
    display_name: form.display_name.trim() || null,
    image: form.image.trim() || null,
    phone: form.phone.trim() || null,
    is_active: form.is_active,
  };
}
