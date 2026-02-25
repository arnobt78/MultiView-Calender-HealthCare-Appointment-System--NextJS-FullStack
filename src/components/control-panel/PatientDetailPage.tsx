"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePatient } from "@/hooks/usePatients";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { PatientDetailForm } from "./PatientDetailForm";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : null;
  const { data: patient, isLoading, isError, error } = usePatient(id);

  if (!id) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-destructive">Invalid patient ID.</p>
        <Button variant="link" asChild><Link href="/control-panel">Back to Control Panel</Link></Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-destructive">{error?.message ?? "Failed to load patient."}</p>
        <Button variant="link" asChild><Link href="/control-panel">Back to Control Panel</Link></Button>
      </div>
    );
  }

  if (isLoading || !patient) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-muted-foreground">Loading patient...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <PageHeader
        title={`Patient: ${patient.firstname} ${patient.lastname}`}
        description="All table schema properties"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/control-panel">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Schema: patients</CardTitle>
          <p className="text-sm text-muted-foreground">
            id, created_at, firstname, lastname, birth_date, care_level, pronoun, email, active, active_since
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-2 text-sm">
            <div><dt className="font-medium text-muted-foreground">id</dt><dd className="font-mono">{patient.id}</dd></div>
            <div><dt className="font-medium text-muted-foreground">created_at</dt><dd>{patient.created_at ? new Date(patient.created_at).toISOString() : "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">firstname</dt><dd>{patient.firstname}</dd></div>
            <div><dt className="font-medium text-muted-foreground">lastname</dt><dd>{patient.lastname}</dd></div>
            <div><dt className="font-medium text-muted-foreground">birth_date</dt><dd>{patient.birth_date ?? "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">care_level</dt><dd>{patient.care_level ?? "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">pronoun</dt><dd>{patient.pronoun ?? "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">email</dt><dd>{patient.email ?? "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">active</dt><dd><Badge variant={patient.active ? "default" : "secondary"}>{String(patient.active)}</Badge></dd></div>
            <div><dt className="font-medium text-muted-foreground">active_since</dt><dd>{patient.active_since ? new Date(patient.active_since).toISOString() : "—"}</dd></div>
          </dl>
          <PatientDetailForm patient={patient} />
        </CardContent>
      </Card>
    </div>
  );
}
