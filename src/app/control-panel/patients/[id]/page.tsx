/**
 * Patient detail — client data via TanStack Query + ?mode=view|edit (PatientDetailScreen).
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { PatientDetailScreen } from "@/components/control-panel/PatientDetailScreen";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  let title = `Patient — ${id.slice(0, 8)}`;
  if (isValidUUID(id)) {
    const p = await prisma.patient.findUnique({
      where: { id },
      select: { firstname: true, lastname: true },
    });
    if (p) {
      const n = `${p.firstname} ${p.lastname}`.trim();
      if (n) title = n;
    }
  }
  return { title };
}

export default async function PatientDetailPage({ params }: PageProps) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const exists = await prisma.patient.findUnique({ where: { id }, select: { id: true } });
  if (!exists) notFound();

  return <PatientDetailScreen patientId={id} />;
}
