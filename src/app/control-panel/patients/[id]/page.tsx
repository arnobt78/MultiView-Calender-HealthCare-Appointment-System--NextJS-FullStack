/**
 * Patient detail — Server Component.
 *
 * Pre-fetches the full patient record and snapshot (appointments, activities,
 * invoices) so PatientDetailScreen receives them as initialPatient / initialSnapshot
 * props and seeds the TanStack Query cache on first render — the detail view
 * renders instantly with real data, no loading flash.
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { PatientDetailScreen } from "@/components/control-panel/PatientDetailScreen";
import {
  prefetchPatient,
  prefetchPatientSnapshot,
} from "@/lib/server-prefetch";
import type { Patient, PatientSnapshot } from "@/types/types";

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

  // Pre-fetch patient + snapshot in parallel. If either returns null the patient
  // doesn't exist — 404. PatientDetailScreen receives them as initial props and
  // seeds the cache so hooks find data immediately without a network round-trip.
  const [initialPatient, initialSnapshot] = await Promise.all<[
    Promise<Patient | null>,
    Promise<PatientSnapshot | null>,
  ]>([prefetchPatient(id), prefetchPatientSnapshot(id)]);

  if (!initialPatient) notFound();

  return (
    <PatientDetailScreen
      patientId={id}
      initialPatient={initialPatient}
      initialSnapshot={initialSnapshot}
    />
  );
}
