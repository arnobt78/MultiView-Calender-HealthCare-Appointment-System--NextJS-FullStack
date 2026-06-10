/**
 * Server-side serializers for Prisma models → JSON (dates to ISO strings).
 * Use in API routes so responses match existing frontend types.
 */

export function serializeCategory(
  c: {
    id: string;
    created_at: Date;
    updated_at: Date | null;
    label: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    is_active?: boolean;
    sort_order?: number;
    duration_minutes_default?: number | null;
    created_by_id?: string | null;
    updated_by_id?: string | null;
    created_by?: UserMini;
    updated_by?: UserMini;
  }
) {
  return {
    id: c.id,
    created_at: c.created_at?.toISOString?.(),
    updated_at: c.updated_at?.toISOString?.() ?? null,
    label: c.label,
    description: c.description,
    color: c.color,
    icon: c.icon,
    is_active: c.is_active,
    sort_order: c.sort_order,
    duration_minutes_default: c.duration_minutes_default,
    created_by_id: c.created_by_id ?? null,
    updated_by_id: c.updated_by_id ?? null,
    created_by_display: userDisplay(c.created_by),
    updated_by_display: userDisplay(c.updated_by),
    created_by_email: c.created_by?.email ?? null,
    updated_by_email: c.updated_by?.email ?? null,
    /** Audit actor portrait + role — detail Record Audit inline row (SSR denormalized). */
    created_by_image: c.created_by?.image ?? null,
    created_by_role: c.created_by?.role ?? null,
    updated_by_image: c.updated_by?.image ?? null,
    updated_by_role: c.updated_by?.role ?? null,
  };
}

type UserMini =
  | {
      id?: string;
      display_name: string | null;
      email: string;
      image?: string | null;
      role?: string | null;
      specialty?: string | null;
    }
  | null
  | undefined;

type PrimaryDoctorMini =
  | { display_name: string | null; email: string; specialty?: string | null; image?: string | null }
  | null
  | undefined;

function userDisplay(u: UserMini): string | null {
  if (!u) return null;
  return (u.display_name?.trim() || u.email) ?? null;
}

/** Patient row → API JSON; optional relation picks add audit / primary-doctor labels for detail views */
export function serializePatient(
  p: {
    id: string;
    created_at: Date;
    updated_at?: Date;
    firstname: string;
    lastname: string;
    birth_date: Date | null;
    care_level: number | null;
    pronoun: string | null;
    email: string | null;
    phone?: string | null;
    active: boolean;
    active_since: Date | null;
    clinical_profile?: unknown | null;
    created_by_id?: string | null;
    updated_by_id?: string | null;
    primary_doctor_id?: string | null;
    created_by?: UserMini;
    updated_by?: UserMini;
    primary_doctor?: PrimaryDoctorMini;
  }
) {
  return {
    id: p.id,
    created_at: p.created_at?.toISOString?.(),
    updated_at: p.updated_at?.toISOString?.() ?? null,
    firstname: p.firstname,
    lastname: p.lastname,
    birth_date: p.birth_date ? p.birth_date.toISOString().slice(0, 10) : null,
    care_level: p.care_level,
    pronoun: p.pronoun,
    email: p.email,
    phone: p.phone ?? null,
    active: p.active,
    active_since: p.active_since?.toISOString?.() ?? null,
    clinical_profile: p.clinical_profile ?? null,
    created_by_id: p.created_by_id ?? null,
    updated_by_id: p.updated_by_id ?? null,
    primary_doctor_id: p.primary_doctor_id ?? null,
    created_by_display: userDisplay(p.created_by),
    updated_by_display: userDisplay(p.updated_by),
    created_by_email: p.created_by?.email ?? null,
    updated_by_email: p.updated_by?.email ?? null,
    /** Audit actor portrait + role — detail Record Audit inline row (SSR denormalized). */
    created_by_image: p.created_by?.image ?? null,
    created_by_role: p.created_by?.role ?? null,
    updated_by_image: p.updated_by?.image ?? null,
    updated_by_role: p.updated_by?.role ?? null,
    primary_doctor_display: userDisplay(p.primary_doctor),
    /** Same relation pick as display — list UI shows email under doctor name. */
    primary_doctor_email: p.primary_doctor?.email ?? null,
    /** Primary doctor specialty for first-paint badge parity in patient portal/profile cards. */
    primary_doctor_specialty: p.primary_doctor?.specialty ?? null,
    /** Primary doctor portrait — SSR denormalized so detail pages skip robohash flash. */
    primary_doctor_image: p.primary_doctor?.image ?? null,
  };
}

export function serializeUser(u: {
  id: string;
  email: string;
  display_name: string | null;
  role: string | null;
  image: string | null;
  created_at: Date;
  updated_at?: Date | null;
  created_by_id?: string | null;
  updated_by_id?: string | null;
  specialty?: string | null;
  bio?: string | null;
  phone?: string | null;
  license_number?: string | null;
  department?: string | null;
  consultation_fee?: number | null;
  office_location?: string | null;
  languages_spoken?: string[];
  years_of_experience?: number | null;
  is_active?: boolean;
  active_since?: Date | null;
  email_verified?: boolean;
  created_by?: UserMini;
  updated_by?: UserMini;
}) {
  return {
    id: u.id,
    email: u.email,
    display_name: u.display_name,
    role: u.role,
    image: u.image,
    created_at: u.created_at?.toISOString?.(),
    updated_at: u.updated_at?.toISOString?.() ?? null,
    created_by_id: u.created_by_id ?? null,
    updated_by_id: u.updated_by_id ?? null,
    specialty: u.specialty ?? null,
    bio: u.bio ?? null,
    phone: u.phone ?? null,
    license_number: u.license_number ?? null,
    department: u.department ?? null,
    consultation_fee: u.consultation_fee ?? null,
    office_location: u.office_location ?? null,
    languages_spoken: u.languages_spoken ?? [],
    years_of_experience: u.years_of_experience ?? null,
    is_active: u.is_active,
    active_since: u.active_since?.toISOString?.() ?? null,
    email_verified: u.email_verified,
    created_by_display: userDisplay(u.created_by),
    updated_by_display: userDisplay(u.updated_by),
    created_by_email: u.created_by?.email ?? null,
    updated_by_email: u.updated_by?.email ?? null,
    created_by_image: u.created_by?.image ?? null,
    created_by_role: u.created_by?.role ?? null,
    updated_by_image: u.updated_by?.image ?? null,
    updated_by_role: u.updated_by?.role ?? null,
  };
}

/** Organization row → API JSON; converts created_at Date to ISO string. */
export function serializeOrganization(o: {
  id: string;
  created_at: Date;
  name: string;
  slug: string;
  owner_user_id: string;
}) {
  return {
    ...o,
    created_at: o.created_at?.toISOString?.(),
  };
}

export function serializeInvoice(i: {
  id: string;
  created_at: Date;
  appointment_id: string | null;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  due_date: Date | null;
  paid_at: Date | null;
  cancelled_at?: Date | null;
  description: string | null;
  payments?: {
    id: string;
    status: string;
    amount: number;
    created_at: Date;
    refunded_at?: Date | null;
    stripe_payment_id?: string | null;
  }[];
}) {
  return {
    ...i,
    created_at: i.created_at?.toISOString?.(),
    due_date: i.due_date ? i.due_date.toISOString().slice(0, 10) : null,
    paid_at: i.paid_at?.toISOString?.() ?? null,
    cancelled_at: i.cancelled_at?.toISOString?.() ?? null,
    payments: (i.payments ?? []).map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      created_at: p.created_at?.toISOString?.() ?? "",
      refunded_at: p.refunded_at?.toISOString?.() ?? null,
      stripe_payment_id: p.stripe_payment_id ?? undefined,
    })),
  };
}

/**
 * Appointment: map Prisma field names to API (`patient_id` → `patient`, etc.).
 * B3: Prisma calendar-owner field is `owner_id` (@map("user_id")); JSON keeps stable `user_id` for clients.
 * `attachments` is the Postgres text[] column (URLs from blob upload or manual entry), serialized as the same key.
 */
export function serializeAppointment(a: {
  id: string;
  created_at: Date;
  updated_at: Date | null;
  start: Date;
  end: Date;
  location: string | null;
  patient_id: string | null;
  category_id: string | null;
  notes: string | null;
  title: string;
  status: string | null;
  owner_id: string;
  /** B2: optional FK to `users.id` — defaults to calendar owner on create / backfill. */
  treating_physician_id?: string | null;
  attachments?: string[] | null;
  /** FK to appointment_types — drives slot math and telehealth flag */
  appointment_type_id?: string | null;
  /** Denormalised from appointment_type.is_telehealth — stored for fast queries without a join */
  is_telehealth?: boolean;
  /** Presenting complaint / reason for visit */
  chief_complaint?: string | null;
  /** Actual appointment duration in minutes */
  duration_minutes?: number | null;
  /** Video call meeting URL — shown as Join Call button when is_telehealth = true */
  telehealth_link?: string | null;
  /** Joined from appointment_type — fee in cents for the visit fee badge on appointment cards. */
  appointment_type_price_cents?: number | null;
  /** Joined from appointment_types.name — category meta row visit type chip. */
  appointment_type_name?: string | null;
  /** Type default slot length — shown beside visit type when booking duration absent. */
  appointment_type_duration_minutes?: number | null;
  /** Treating physician (or owner) consultation_fee — second fallback for visit fee badge. */
  doctor_consultation_fee_cents?: number | null;
}) {
  const attachmentList = a.attachments ?? [];
  return {
    id: a.id,
    created_at: a.created_at?.toISOString?.(),
    updated_at: a.updated_at?.toISOString?.() ?? null,
    start: a.start?.toISOString?.(),
    end: a.end?.toISOString?.(),
    location: a.location,
    patient: a.patient_id,
    category: a.category_id,
    notes: a.notes,
    title: a.title,
    status: a.status,
    user_id: a.owner_id,
    treating_physician_id: a.treating_physician_id ?? null,
    attachments: attachmentList,
    appointment_type_id: a.appointment_type_id ?? null,
    is_telehealth: a.is_telehealth ?? false,
    chief_complaint: a.chief_complaint ?? null,
    duration_minutes: a.duration_minutes ?? null,
    telehealth_link: a.telehealth_link ?? null,
    appointment_type_price_cents: a.appointment_type_price_cents ?? null,
    appointment_type_name: a.appointment_type_name ?? null,
    appointment_type_duration_minutes: a.appointment_type_duration_minutes ?? null,
    doctor_consultation_fee_cents: a.doctor_consultation_fee_cents ?? null,
  };
}

/** Joined doctor/admin on portal appointment rows — `id` + `role` drive portal profile links. */
export type PortalAppointmentClinicianUser = {
  id: string;
  display_name: string | null;
  email: string;
  role: string | null;
  image?: string | null;
  specialty?: string | null;
  /** Included when select contains consultation_fee — drives visit fee badge second fallback. */
  consultation_fee?: number | null;
  /** Doctor office — display fallback when `appointment.location` unset. */
  office_location?: string | null;
};

/** @deprecated Use `PortalAppointmentClinicianUser` — not `/staff` routes. */
export type PortalAppointmentStaffUser = PortalAppointmentClinicianUser;

/** Prisma appointment row + optional `category` / `owner` / `treating_physician` includes for portal responses */
export type PortalAppointmentIncludeRow = Parameters<typeof serializeAppointment>[0] & {
  category?: {
    id: string;
    label: string;
    color: string | null;
    icon?: string | null;
    created_at?: Date;
    updated_at?: Date | null;
    description?: string | null;
  } | null;
  owner?: PortalAppointmentClinicianUser | null;
  /** B2: joined user row for `treating_physician_id` when set (display chip). */
  treating_physician?: PortalAppointmentClinicianUser | null;
  /** Joined from appointment_type — name/price/duration for portal + dashboard cards. */
  appointment_type?: {
    name?: string | null;
    price_cents: number;
    duration_minutes?: number | null;
  } | null;
};

/** Serialized portal appointment — `category` stays UUID; rich chip uses `category_data`. */
export type PortalAppointmentRow = ReturnType<typeof mapPortalAppointmentsFromRows>[number];

/**
 * Patient portal GET + patient dashboard GET /api/appointments: embedded staff for cards
 * without `/api/users/search`. `owner` = calendar owner (`user_id` on JSON).
 */
export function mapPortalAppointmentsFromRows(rows: PortalAppointmentIncludeRow[]) {
  return rows.map((a) => {
    const feeDoctor = a.treating_physician ?? a.owner;
    const base = serializeAppointment({
      ...a,
      appointment_type_price_cents: a.appointment_type?.price_cents ?? null,
      appointment_type_name: a.appointment_type?.name ?? null,
      appointment_type_duration_minutes: a.appointment_type?.duration_minutes ?? null,
      doctor_consultation_fee_cents: feeDoctor?.consultation_fee ?? null,
    });
    return {
      ...base,
      category_data: a.category
        ? {
            id: a.category.id,
            label: a.category.label,
            color: a.category.color,
            icon: a.category.icon ?? null,
            created_at: a.category.created_at?.toISOString?.() ?? new Date().toISOString(),
            updated_at: a.category.updated_at?.toISOString?.() ?? null,
            description: a.category.description ?? null,
          }
        : undefined,
      owner: a.owner
        ? {
            id: a.owner.id,
            display_name: a.owner.display_name,
            email: a.owner.email,
            role: a.owner.role,
            image: a.owner.image ?? null,
            specialty: a.owner.specialty ?? null,
            office_location: a.owner.office_location ?? null,
          }
        : undefined,
      treating_physician: a.treating_physician
        ? {
            id: a.treating_physician.id,
            display_name: a.treating_physician.display_name,
            email: a.treating_physician.email,
            role: a.treating_physician.role,
            image: a.treating_physician.image ?? null,
            specialty: a.treating_physician.specialty ?? null,
            office_location: a.treating_physician.office_location ?? null,
          }
        : undefined,
    };
  });
}

/** Doctor portal today/upcoming — clinician office embed for `resolveAppointmentDisplayLocation`. */
export type DoctorPortalAppointmentIncludeRow = Parameters<typeof serializeAppointment>[0] & {
  treating_physician?: { consultation_fee?: number | null; office_location?: string | null } | null;
  owner?: { consultation_fee?: number | null; office_location?: string | null } | null;
  appointment_type?: {
    name?: string | null;
    price_cents: number;
    duration_minutes?: number | null;
  } | null;
};

export function mapDoctorPortalAppointmentsFromRows(rows: DoctorPortalAppointmentIncludeRow[]) {
  return rows.map((a) => {
    const feeDoctor = a.treating_physician ?? a.owner;
    const base = serializeAppointment({
      ...a,
      appointment_type_price_cents: a.appointment_type?.price_cents ?? null,
      appointment_type_name: a.appointment_type?.name ?? null,
      appointment_type_duration_minutes: a.appointment_type?.duration_minutes ?? null,
      doctor_consultation_fee_cents: feeDoctor?.consultation_fee ?? null,
    });
    return {
      ...base,
      owner: a.owner ? { office_location: a.owner.office_location ?? null } : undefined,
      treating_physician: a.treating_physician
        ? { office_location: a.treating_physician.office_location ?? null }
        : undefined,
    };
  });
}
