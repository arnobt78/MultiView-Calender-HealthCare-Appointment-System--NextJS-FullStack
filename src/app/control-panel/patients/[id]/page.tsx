/**
 * SSR: Patient detail page.
 * Server fetches the patient via Prisma, passes to client component for editing.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializePatient } from "@/lib/serializers";
import { isValidUUID } from "@/lib/validation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { PatientDetailForm } from "@/components/control-panel/PatientDetailForm";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Patient — ${id.slice(0, 8)}` };
}

export default async function PatientDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const raw = await prisma.patient.findUnique({ where: { id } });
  if (!raw) notFound();

  const patient = serializePatient(raw);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <PageHeader
        title={`${patient.firstname} ${patient.lastname}`}
        description="Patient — all table schema properties"
        actions={
          <Button variant="outline" asChild>
            <Link href="/control-panel">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Schema: patients</CardTitle>
          <p className="text-sm text-muted-foreground">
            id · created_at · firstname · lastname · birth_date · care_level · pronoun · email · active · active_since
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* All schema fields */}
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">id</dt>
              <dd className="font-mono break-all text-xs mt-0.5">{patient.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">created_at</dt>
              <dd className="mt-0.5">{patient.created_at ? new Date(patient.created_at).toLocaleString() : "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">firstname</dt>
              <dd className="mt-0.5">{patient.firstname}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">lastname</dt>
              <dd className="mt-0.5">{patient.lastname}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">email</dt>
              <dd className="mt-0.5">{patient.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">birth_date</dt>
              <dd className="mt-0.5">{patient.birth_date ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">care_level</dt>
              <dd className="mt-0.5">{patient.care_level ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">pronoun</dt>
              <dd className="mt-0.5">{patient.pronoun ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">active</dt>
              <dd className="mt-0.5">
                <Badge variant={patient.active ? "default" : "secondary"}>
                  {patient.active ? "Yes" : "No"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">active_since</dt>
              <dd className="mt-0.5">{patient.active_since ? new Date(patient.active_since).toLocaleString() : "—"}</dd>
            </div>
          </dl>

          {/* Edit form (client component) */}
          <PatientDetailForm patient={patient} />
        </CardContent>
      </Card>
    </div>
  );
}

