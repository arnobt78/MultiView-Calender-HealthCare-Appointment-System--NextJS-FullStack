import {
  doctorDetailHref,
  portalAdminDetailHref,
  userDetailHref,
  type EntityRole,
} from "@/lib/entity-routes";
import { isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";
import type { Category, Patient, User } from "@/types/types";

/** Serialized org detail — audit denormalized fields from `serializeOrganization`. */
export type OrganizationAuditSource = {
  created_by_id?: string | null;
  created_by_display?: string | null;
  created_by_email?: string | null;
  created_by_image?: string | null;
  created_by_role?: string | null;
  updated_by_id?: string | null;
  updated_by_display?: string | null;
  updated_by_email?: string | null;
  updated_by_image?: string | null;
  updated_by_role?: string | null;
};

/** Staff row on entity detail Record Audit — avatar, name, email, role badge. */
export type EntityDetailAuditActor = {
  userId: string;
  label: string;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

type AuditUserRow = {
  id: string;
  display_name: string | null;
  email: string;
  image: string | null;
  role: string | null;
};

type ClinicianFallback = {
  id: string;
  display_name: string | null;
  email: string;
  image: string | null;
  role: string | null;
};

function mapRecordAuditActorFromDenormalizedFields(
  id: string | null | undefined,
  display: string | null | undefined,
  email: string | null | undefined,
  image: string | null | undefined,
  role: string | null | undefined
): EntityDetailAuditActor | null {
  if (!id || !display?.trim()) return null;
  return mapEntityDetailAuditActor({
    id,
    display_name: display.trim(),
    email: email ?? "",
    image: image ?? null,
    role: role ?? null,
  });
}

/** Patient detail — map denormalized audit fields from `serializePatient`. */
export function mapPatientRecordAuditActors(patient: Patient): {
  createdBy: EntityDetailAuditActor | null;
  updatedBy: EntityDetailAuditActor | null;
} {
  return {
    createdBy: mapRecordAuditActorFromDenormalizedFields(
      patient.created_by_id,
      patient.created_by_display,
      patient.created_by_email,
      patient.created_by_image,
      patient.created_by_role
    ),
    updatedBy: mapRecordAuditActorFromDenormalizedFields(
      patient.updated_by_id,
      patient.updated_by_display,
      patient.updated_by_email,
      patient.updated_by_image,
      patient.updated_by_role
    ),
  };
}

/** User/doctor detail — map denormalized audit fields from `serializeUser`. */
export function mapUserRecordAuditActors(user: User): {
  createdBy: EntityDetailAuditActor | null;
  updatedBy: EntityDetailAuditActor | null;
} {
  return {
    createdBy: mapRecordAuditActorFromDenormalizedFields(
      user.created_by_id,
      user.created_by_display,
      user.created_by_email,
      user.created_by_image,
      user.created_by_role
    ),
    updatedBy: mapRecordAuditActorFromDenormalizedFields(
      user.updated_by_id,
      user.updated_by_display,
      user.updated_by_email,
      user.updated_by_image,
      user.updated_by_role
    ),
  };
}

/** Category detail — map denormalized audit fields from `serializeCategory`. */
export function mapCategoryRecordAuditActors(category: Category): {
  createdBy: EntityDetailAuditActor | null;
  updatedBy: EntityDetailAuditActor | null;
} {
  return {
    createdBy: mapRecordAuditActorFromDenormalizedFields(
      category.created_by_id,
      category.created_by_display,
      category.created_by_email,
      category.created_by_image,
      category.created_by_role
    ),
    updatedBy: mapRecordAuditActorFromDenormalizedFields(
      category.updated_by_id,
      category.updated_by_display,
      category.updated_by_email,
      category.updated_by_image,
      category.updated_by_role
    ),
  };
}

/** Invoice detail — map denormalized audit fields from `serializeInvoice`. */
export function mapInvoiceRecordAuditActors(invoice: {
  created_by_id?: string | null;
  created_by_display?: string | null;
  created_by_email?: string | null;
  created_by_image?: string | null;
  created_by_role?: string | null;
  updated_by_id?: string | null;
  updated_by_display?: string | null;
  updated_by_email?: string | null;
  updated_by_image?: string | null;
  updated_by_role?: string | null;
  /** Billing owner fallback when `created_by_id` not yet backfilled. */
  user_id?: string;
  issuer_label?: string | null;
  issuer_email?: string | null;
  issuer_image?: string | null;
  issuer_role?: string | null;
}): {
  createdBy: EntityDetailAuditActor | null;
  updatedBy: EntityDetailAuditActor | null;
} {
  const createdBy =
    mapRecordAuditActorFromDenormalizedFields(
      invoice.created_by_id,
      invoice.created_by_display,
      invoice.created_by_email,
      invoice.created_by_image,
      invoice.created_by_role
    ) ??
    (invoice.user_id && invoice.issuer_label?.trim()
      ? {
          userId: invoice.user_id,
          label: invoice.issuer_label.trim(),
          email: invoice.issuer_email,
          image: invoice.issuer_image,
          role: invoice.issuer_role,
        }
      : null);

  return {
    createdBy,
    updatedBy: mapRecordAuditActorFromDenormalizedFields(
      invoice.updated_by_id,
      invoice.updated_by_display,
      invoice.updated_by_email,
      invoice.updated_by_image,
      invoice.updated_by_role
    ),
  };
}

/** Visit detached — map frozen actor from denormalized invoice fields (REQ-0114). */
export function mapInvoiceVisitDetachedByActor(invoice: {
  visit_detached_by_id?: string | null;
  visit_detached_by_display?: string | null;
  visit_detached_by_email?: string | null;
  visit_detached_by_image?: string | null;
  visit_detached_by_role?: string | null;
}): EntityDetailAuditActor | null {
  return mapRecordAuditActorFromDenormalizedFields(
    invoice.visit_detached_by_id,
    invoice.visit_detached_by_display,
    invoice.visit_detached_by_email,
    invoice.visit_detached_by_image,
    invoice.visit_detached_by_role
  );
}

/** Invoice soft-delete — map frozen actor from denormalized invoice fields (REQ-0114). */
export function mapInvoiceSoftDeletedByActor(invoice: {
  deleted_by_id?: string | null;
  deleted_by_display?: string | null;
  deleted_by_email?: string | null;
  deleted_by_image?: string | null;
  deleted_by_role?: string | null;
}): EntityDetailAuditActor | null {
  return mapRecordAuditActorFromDenormalizedFields(
    invoice.deleted_by_id,
    invoice.deleted_by_display,
    invoice.deleted_by_email,
    invoice.deleted_by_image,
    invoice.deleted_by_role
  );
}

/** Shared invoice slice for deletion meta UI (list, detail banner, audit rows). */
export type InvoiceDeletionMetaSlice = {
  kind: "visit" | "invoice";
  at: string;
  actor: EntityDetailAuditActor | null;
};

export type InvoiceDeletionMetaSource = {
  visit_detached_at?: string | null;
  visit_detached_by_id?: string | null;
  visit_detached_by_display?: string | null;
  visit_detached_by_email?: string | null;
  visit_detached_by_image?: string | null;
  visit_detached_by_role?: string | null;
  deleted_at?: string | null;
  deleted_by_id?: string | null;
  deleted_by_display?: string | null;
  deleted_by_email?: string | null;
  deleted_by_image?: string | null;
  deleted_by_role?: string | null;
};

export function resolveInvoiceVisitDeletionMeta(
  invoice: InvoiceDeletionMetaSource
): InvoiceDeletionMetaSlice | null {
  const at = invoice.visit_detached_at?.trim();
  if (!at) return null;
  return {
    kind: "visit",
    at,
    actor: mapInvoiceVisitDetachedByActor(invoice),
  };
}

export function resolveInvoiceSoftDeletionMeta(
  invoice: InvoiceDeletionMetaSource
): InvoiceDeletionMetaSlice | null {
  const at = invoice.deleted_at?.trim();
  if (!at) return null;
  return {
    kind: "invoice",
    at,
    actor: mapInvoiceSoftDeletedByActor(invoice),
  };
}

/** Visit detached first, then invoice soft-delete — detail banner + audit rows. */
export function listInvoiceDeletionMetaSlices(
  invoice: InvoiceDeletionMetaSource
): InvoiceDeletionMetaSlice[] {
  const slices: InvoiceDeletionMetaSlice[] = [];
  const visit = resolveInvoiceVisitDeletionMeta(invoice);
  if (visit) slices.push(visit);
  const deleted = resolveInvoiceSoftDeletionMeta(invoice);
  if (deleted) slices.push(deleted);
  return slices;
}

/** Organization detail — map denormalized audit fields from `serializeOrganization`. */
export function mapOrganizationRecordAuditActors(org: OrganizationAuditSource): {
  createdBy: EntityDetailAuditActor | null;
  updatedBy: EntityDetailAuditActor | null;
} {
  return {
    createdBy: mapRecordAuditActorFromDenormalizedFields(
      org.created_by_id,
      org.created_by_display,
      org.created_by_email,
      org.created_by_image,
      org.created_by_role
    ),
    updatedBy: mapRecordAuditActorFromDenormalizedFields(
      org.updated_by_id,
      org.updated_by_display,
      org.updated_by_email,
      org.updated_by_image,
      org.updated_by_role
    ),
  };
}

/** Map Prisma audit include (or calendar owner fallback) to UI actor. */
export function mapEntityDetailAuditActor(
  row: AuditUserRow | null | undefined,
  fallback?: ClinicianFallback | null
): EntityDetailAuditActor | null {
  const source = row ?? fallback;
  if (!source?.id) return null;
  const label = source.display_name?.trim() || source.email?.trim();
  if (!label) return null;
  return {
    userId: source.id,
    label,
    email: source.email,
    image: source.image,
    role: source.role,
  };
}

/** Role-aware href for audit inline rows (CP users/doctors vs portal admins). */
export function resolveEntityDetailAuditActorHref(
  viewerRole: EntityRole,
  actor: Pick<EntityDetailAuditActor, "userId" | "role">
): string | null {
  if (!isValidUUID(actor.userId)) return null;
  const accountRole = actor.role;
  if (accountRole === "admin") {
    const portal = portalAdminDetailHref(viewerRole, actor.userId, "admin");
    if (portal) return portal;
    if (isAdminRole(viewerRole)) return userDetailHref(viewerRole, actor.userId);
    return null;
  }
  if (accountRole === "doctor") {
    return doctorDetailHref(viewerRole, actor.userId);
  }
  if (isAdminRole(viewerRole)) return userDetailHref(viewerRole, actor.userId);
  return null;
}
