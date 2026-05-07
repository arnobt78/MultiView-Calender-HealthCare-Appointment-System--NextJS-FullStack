/**
 * Server-side serializers for Prisma models → JSON (dates to ISO strings).
 * Use in API routes so responses match existing frontend types.
 */

export function serializeCategory(c: {
  id: string;
  created_at: Date;
  updated_at: Date | null;
  label: string;
  description: string | null;
  color: string | null;
  icon: string | null;
}) {
  return {
    ...c,
    created_at: c.created_at?.toISOString?.(),
    updated_at: c.updated_at?.toISOString?.() ?? null,
  };
}

type UserMini = { display_name: string | null; email: string } | null | undefined;

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
    primary_doctor?: UserMini;
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
  };
}

/** Activity row for patient snapshot API — includes optional creator display name */
export function serializeActivitySnapshot(a: {
  id: string;
  created_at: Date;
  created_by_id: string | null;
  appointment_id: string;
  type: string;
  content: string;
  created_by?: { display_name: string | null; email: string } | null;
}) {
  return {
    id: a.id,
    created_at: a.created_at.toISOString(),
    created_by: a.created_by_id,
    appointment: a.appointment_id,
    type: a.type,
    content: a.content,
    created_by_display: a.created_by?.display_name ?? a.created_by?.email ?? null,
  };
}

export function serializeUser(u: {
  id: string;
  email: string;
  display_name: string | null;
  role: string | null;
  image: string | null;
  created_at: Date;
}) {
  return {
    ...u,
    created_at: u.created_at?.toISOString?.(),
  };
}

export function serializeRelative(r: {
  id: string;
  created_at: Date;
  firstname: string;
  lastname: string;
  pronoun: string | null;
  notes: string | null;
}) {
  return {
    ...r,
    created_at: r.created_at?.toISOString?.(),
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

/** Appointment: map Prisma field names to API (patient_id → patient, category_id → category) */
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
  user_id: string;
  attachements: string[];
}) {
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
    user_id: a.user_id,
    attachements: a.attachements ?? [],
  };
}
