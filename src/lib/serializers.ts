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
  };
}

type UserMini =
  | { display_name: string | null; email: string; specialty?: string | null }
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
  specialty?: string | null;
  bio?: string | null;
}) {
  return {
    ...u,
    created_at: u.created_at?.toISOString?.(),
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
  description: string | null;
}) {
  return {
    ...i,
    created_at: i.created_at?.toISOString?.(),
    due_date: i.due_date ? i.due_date.toISOString().slice(0, 10) : null,
    paid_at: i.paid_at?.toISOString?.() ?? null,
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
  };
}

/** Joined staff user on portal appointment rows — `id` + `role` drive `/doctors/:id` links for patients. */
export type PortalAppointmentStaffUser = {
  id: string;
  display_name: string | null;
  email: string;
  role: string | null;
  image?: string | null;
  specialty?: string | null;
};

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
  owner?: PortalAppointmentStaffUser | null;
  /** B2: joined user row for `treating_physician_id` when set (display chip). */
  treating_physician?: PortalAppointmentStaffUser | null;
};

/** Serialized portal appointment — `category` stays UUID; rich chip uses `category_data`. */
export type PortalAppointmentRow = ReturnType<typeof mapPortalAppointmentsFromRows>[number];

/**
 * Patient portal GET + patient dashboard GET /api/appointments: embedded staff for cards
 * without `/api/users/search`. `owner` = calendar owner (`user_id` on JSON).
 */
export function mapPortalAppointmentsFromRows(rows: PortalAppointmentIncludeRow[]) {
  return rows.map((a) => {
    const base = serializeAppointment(a);
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
          }
        : undefined,
    };
  });
}
