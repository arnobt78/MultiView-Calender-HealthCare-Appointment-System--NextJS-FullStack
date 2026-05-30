/**
 * Resolves `category_id` for patient-portal booking when the client omits category.
 * Order: visit-type label match → type-name tokens → doctor specialty tokens → label substring → default active category.
 */
import type { PrismaClient } from "@prisma/client";
import { SPECIALTIES } from "@/lib/doctor-specialty";

/** Substrings matched against active category labels (seeded service categories). */
export const SPECIALTY_CATEGORY_LABEL_TOKENS: Record<string, readonly string[]> = {
  "General Medicine": ["Primary Care", "Preventive"],
  Cardiology: ["Cardiology", "Vascular"],
  Dermatology: ["Dermatology", "Skin"],
  Neurology: ["Neurology", "Cognitive"],
  Pediatrics: ["Pediatrics", "Adolescent"],
  Oncology: ["Primary Care", "Preventive"],
  Orthopedics: ["Primary Care", "Preventive"],
  Psychiatry: ["Mental Health", "Psychiatry"],
  Other: ["Primary Care", "Preventive"],
};

/** Global visit-type names that imply a category before falling back to doctor specialty. */
const VISIT_TYPE_CATEGORY_TOKENS: Record<string, readonly string[]> = {
  "annual check-up": ["Primary Care", "Preventive"],
  "annual check up": ["Primary Care", "Preventive"],
  telehealth: ["Primary Care", "Preventive"],
};

type CategoryLookup = Pick<PrismaClient, "category">;

async function findActiveCategoryByLabelTokens(
  prisma: CategoryLookup,
  tokens: readonly string[]
): Promise<string | null> {
  const trimmed = tokens.map((t) => t.trim()).filter(Boolean);
  if (trimmed.length === 0) return null;

  const row = await prisma.category.findFirst({
    where: {
      is_active: true,
      OR: trimmed.map((token) => ({
        label: { contains: token, mode: "insensitive" as const },
      })),
    },
    orderBy: { sort_order: "asc" },
    select: { id: true },
  });
  return row?.id ?? null;
}

async function findDefaultActiveCategoryId(prisma: CategoryLookup): Promise<string | null> {
  const row = await prisma.category.findFirst({
    where: { is_active: true },
    orderBy: { sort_order: "asc" },
    select: { id: true },
  });
  return row?.id ?? null;
}

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

function tokensForVisitTypeName(typeName: string | null | undefined): readonly string[] {
  if (!typeName?.trim()) return [];
  const key = normalizeLookupKey(typeName);
  return VISIT_TYPE_CATEGORY_TOKENS[key] ?? [];
}

function tokensForDoctorSpecialty(specialty: string | null | undefined): readonly string[] {
  if (!specialty?.trim()) return [];
  const exact = SPECIALTY_CATEGORY_LABEL_TOKENS[specialty.trim()];
  if (exact?.length) return exact;
  // Unknown specialty string — still try label substring on the raw specialty.
  return [specialty.trim()];
}

export async function resolvePatientBookingCategoryId(
  prisma: PrismaClient,
  doctorId: string,
  appointmentTypeId: string | null
): Promise<string | null> {
  let typeName: string | null = null;

  if (appointmentTypeId) {
    const apptType = await prisma.appointmentType.findFirst({
      where: {
        id: appointmentTypeId,
        OR: [{ user_id: doctorId }, { user_id: null }],
      },
      select: { name: true },
    });
    typeName = apptType?.name?.trim() ?? null;

    if (typeName) {
      const exactLabel = await prisma.category.findFirst({
        where: {
          is_active: true,
          label: { equals: typeName, mode: "insensitive" },
        },
        select: { id: true },
      });
      if (exactLabel) return exactLabel.id;

      const fromVisitType = await findActiveCategoryByLabelTokens(
        prisma,
        tokensForVisitTypeName(typeName)
      );
      if (fromVisitType) return fromVisitType;
    }
  }

  const doctor = await prisma.user.findUnique({
    where: { id: doctorId },
    select: { specialty: true },
  });
  const specialty = doctor?.specialty?.trim() ?? null;

  if (specialty) {
    const fromSpecialtyTokens = await findActiveCategoryByLabelTokens(
      prisma,
      tokensForDoctorSpecialty(specialty)
    );
    if (fromSpecialtyTokens) return fromSpecialtyTokens;

    const bySpecialtySubstring = await prisma.category.findFirst({
      where: {
        is_active: true,
        label: { contains: specialty, mode: "insensitive" },
      },
      orderBy: { sort_order: "asc" },
      select: { id: true },
    });
    if (bySpecialtySubstring) return bySpecialtySubstring.id;
  }

  // Every booking should land in a category when any active row exists (Primary Care default).
  return findDefaultActiveCategoryId(prisma);
}

/** Exported for tests — ensures token map covers all configured specialties. */
export function specialtyCategoryTokenKeys(): readonly string[] {
  return SPECIALTIES as unknown as string[];
}
