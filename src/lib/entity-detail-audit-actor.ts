import {
  doctorDetailHref,
  portalAdminDetailHref,
  userDetailHref,
  type EntityRole,
} from "@/lib/entity-routes";
import { isAdminRole } from "@/lib/rbac";
import { isValidUUID } from "@/lib/validation";
import type { Category, Patient, User } from "@/types/types";

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
