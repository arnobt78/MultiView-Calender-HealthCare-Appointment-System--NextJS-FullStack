import type { User } from "@/types/types";

/** Admin/staff user edit dialog — non-clinical fields only (doctors use DoctorFormDialog). */
export type AdminUserFormValues = {
  display_name: string;
  role: string;
  image: string;
};

export const EMPTY_ADMIN_USER_FORM: AdminUserFormValues = {
  display_name: "",
  role: "admin",
  image: "",
};

export function userToAdminUserForm(user: User): AdminUserFormValues {
  return {
    display_name: user.display_name?.trim() ?? "",
    role: user.role?.trim() || "admin",
    image: user.image?.trim() ?? "",
  };
}

export function adminUserFormToUpdatePayload(form: AdminUserFormValues) {
  return {
    display_name: form.display_name.trim() || null,
    role: form.role.trim() || null,
    image: form.image.trim() || null,
  };
}
