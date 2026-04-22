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

export function serializePatient(p: {
  id: string;
  created_at: Date;
  firstname: string;
  lastname: string;
  birth_date: Date | null;
  care_level: number | null;
  pronoun: string | null;
  email: string | null;
  active: boolean;
  active_since: Date | null;
}) {
  return {
    ...p,
    created_at: p.created_at?.toISOString?.(),
    birth_date: p.birth_date ? p.birth_date.toISOString().slice(0, 10) : null,
    active_since: p.active_since?.toISOString?.() ?? null,
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

/** Appointment: map Prisma field names to API (patient_id → patient, category_id → category) */
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
