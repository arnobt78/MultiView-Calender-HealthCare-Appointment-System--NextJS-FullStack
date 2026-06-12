import type { DoctorIdentityDoctor } from "@/components/shared/doctor-display/DoctorIdentityRow";
import type { User } from "@/types/types";

export type DoctorIdentityUserInput = Pick<
  User,
  "id" | "display_name" | "email" | "image" | "specialty"
>;

/** Map staff `User` row to doctor identity display shape (filters, insights scope, pickers). */
export function userToDoctorIdentity(user: DoctorIdentityUserInput): DoctorIdentityDoctor {
  return {
    id: user.id,
    display_name: user.display_name,
    email: user.email,
    image: user.image,
    specialty: user.specialty,
  };
}

/** Radix `textValue` search for doctor filter selects. */
export function doctorSelectSearchText(user: DoctorIdentityUserInput): string {
  return [user.display_name, user.email, user.specialty]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}
