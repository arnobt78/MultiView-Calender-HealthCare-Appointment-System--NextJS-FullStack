import type { User } from "@/types/types";
import type { UserUpdateInput } from "@/hooks/useUsers";

/** Edit-only doctor form — maps to PATCH /api/users/[id]. */
export type DoctorFormValues = {
  display_name: string;
  specialty: string;
  bio: string;
  is_active: boolean;
  phone: string;
  license_number: string;
  department: string;
  office_location: string;
  /** Dollars string for UI — converted to cents on submit. */
  consultation_fee: string;
  years_of_experience: string;
  /** Comma-separated languages for UI. */
  languages_spoken: string;
};

export const EMPTY_DOCTOR_FORM: DoctorFormValues = {
  display_name: "",
  specialty: "",
  bio: "",
  is_active: true,
  phone: "",
  license_number: "",
  department: "",
  office_location: "",
  consultation_fee: "",
  years_of_experience: "",
  languages_spoken: "",
};

export function userToDoctorForm(user: User): DoctorFormValues {
  const feeCents = user.consultation_fee;
  return {
    display_name: user.display_name?.trim() ?? "",
    specialty: user.specialty?.trim() ?? "",
    bio: user.bio?.trim() ?? "",
    is_active: user.is_active !== false,
    phone: user.phone?.trim() ?? "",
    license_number: user.license_number?.trim() ?? "",
    department: user.department?.trim() ?? "",
    office_location: user.office_location?.trim() ?? "",
    consultation_fee:
      feeCents != null && Number.isFinite(feeCents) ? String(feeCents / 100) : "",
    years_of_experience:
      user.years_of_experience != null ? String(user.years_of_experience) : "",
    languages_spoken: (user.languages_spoken ?? []).join(", "),
  };
}

export function doctorFormToUpdatePayload(form: DoctorFormValues): UserUpdateInput {
  const feeRaw = form.consultation_fee.trim();
  const feeParsed = feeRaw ? Math.round(parseFloat(feeRaw) * 100) : null;
  const yearsRaw = form.years_of_experience.trim();
  const yearsParsed = yearsRaw ? parseInt(yearsRaw, 10) : null;

  return {
    display_name: form.display_name.trim() || null,
    specialty: form.specialty.trim() || null,
    bio: form.bio.trim() || null,
    is_active: form.is_active,
    phone: form.phone.trim() || null,
    license_number: form.license_number.trim() || null,
    department: form.department.trim() || null,
    office_location: form.office_location.trim() || null,
    consultation_fee:
      feeParsed != null && Number.isFinite(feeParsed) ? feeParsed : null,
    years_of_experience:
      yearsParsed != null && Number.isFinite(yearsParsed) ? yearsParsed : null,
    languages_spoken: form.languages_spoken
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean),
  };
}
