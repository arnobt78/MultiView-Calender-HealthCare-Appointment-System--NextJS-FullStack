"use client";

import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { useRouter, useSearchParams } from "next/navigation";
import { usePatient, usePatientSnapshot } from "@/hooks/usePatients";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { PatientDetailForm } from "@/components/control-panel/PatientDetailForm";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { DEMO_ACCOUNTS } from "@/lib/demo-credentials";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { usePatients } from "@/hooks/usePatients";

const FORM_ID = "patient-detail-form";

export function PatientDetailScreen({ patientId }: { patientId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "view";
  const { data: patient, isLoading, isError, error } = usePatient(patientId);
  const snap = usePatientSnapshot(patientId);
  const { deletePatient, isDeleting, isUpdating } = usePatients();

  const setMode = (next: "view" | "edit") => {
    const q = new URLSearchParams(searchParams.toString());
    if (next === "view") q.delete("mode");
    else q.set("mode", "edit");
    const qs = q.toString();
    router.replace(`/control-panel/patients/${patientId}${qs ? `?${qs}` : ""}`);
  };

  if (isLoading || !patient) {
    return (
      <div className="max-w-9xl mx-auto space-y-4 px-2 sm:px-4 lg:px-8 text-gray-700">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-destructive">
        {error instanceof Error ? error.message : "Failed to load patient"}
      </div>
    );
  }

  const nameLabel = `${patient.firstname} ${patient.lastname}`.trim();
  const fallbackText = nameLabel || patient.email || "?";
  const avatarSrc = patient.email
    ? DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === patient.email?.toLowerCase())?.avatarUrl ??
    null
    : null;

  const cp = patient.clinical_profile;

  return (
    <div className="max-w-9xl mx-auto space-y-4 px-2 pb-28 sm:px-4 lg:px-8 text-gray-700">
      <PageHeader
        title={nameLabel}
        description="Patient record — schema fields, clinical profile, related activity"
        actions={
          <Button variant="outline" asChild>
            <PrefetchingLink href="/control-panel/patient-management">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </PrefetchingLink>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <p className="text-sm text-muted-foreground">
            id · created_at · demographics · clinical_profile (JSON) · active
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <UserAvatar src={avatarSrc} fallbackText={fallbackText} sizeClassName="h-16 w-16" />
            <div>
              <p className="font-semibold text-lg">{nameLabel || "—"}</p>
              <p className="text-sm text-muted-foreground">{patient.email ?? "—"}</p>
              <Badge
                variant="outline"
                className={
                  patient.active
                    ? "mt-1 border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "mt-1 border-slate-200 bg-slate-50 text-slate-600"
                }
              >
                {patient.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {mode === "view" ? (
            <>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-muted-foreground">id</dt>
                  <dd className="font-mono break-all text-xs mt-0.5">{patient.id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">created_at</dt>
                  <dd className="mt-0.5">
                    {patient.created_at ? new Date(patient.created_at).toLocaleString() : "—"}
                  </dd>
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
                  <dt className="font-medium text-muted-foreground">Allergies</dt>
                  <dd className="mt-0.5">
                    {cp && typeof cp === "object" && Array.isArray(cp.allergies)
                      ? cp.allergies.join(", ")
                      : "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-medium text-muted-foreground">Clinical notes</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap">
                    {cp && typeof cp === "object" && typeof cp.notes === "string"
                      ? cp.notes
                      : "—"}
                  </dd>
                </div>
              </dl>

              <div className="space-y-3">
                <h4 className="font-medium">Related appointments</h4>
                {snap.isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>When</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(snap.data?.appointments ?? []).slice(0, 12).map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.title}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {a.start ? format(new Date(a.start), "PPp") : "—"}
                            </TableCell>
                            <TableCell>{a.category_label ?? "—"}</TableCell>
                            <TableCell>{a.status ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                        {(snap.data?.appointments ?? []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No appointments
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Activities</h4>
                {snap.isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <ul className="space-y-2 text-sm">
                    {(snap.data?.activities ?? []).slice(0, 12).map((act) => (
                      <li key={act.id} className="rounded-lg border p-2">
                        <p className="text-xs text-muted-foreground">
                          {act.created_at ? format(new Date(act.created_at), "PPp") : ""}
                          {act.created_by_display ? ` · ${act.created_by_display}` : ""}
                        </p>
                        <p className="font-medium">{act.type}</p>
                        <p className="text-muted-foreground line-clamp-2">{act.content}</p>
                      </li>
                    ))}
                    {(snap.data?.activities ?? []).length === 0 && (
                      <p className="text-muted-foreground text-sm">No activities</p>
                    )}
                  </ul>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Invoices (via appointments)</h4>
                {snap.isLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(snap.data?.invoices ?? []).slice(0, 12).map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell>
                              {(inv.amount / 100).toFixed(2)} {inv.currency}
                            </TableCell>
                            <TableCell>{inv.status}</TableCell>
                            <TableCell>{inv.due_date ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                        {(snap.data?.invoices ?? []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No invoices
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <PatientDetailForm
              key={`${patient.id}-${JSON.stringify(patient.clinical_profile)}`}
              patient={patient}
              formId={FORM_ID}
              onSaved={() => setMode("view")}
              submitActions="none"
            />
          )}
        </CardContent>
      </Card>

      {/* Footer actions — URL mode drives view vs edit */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-9xl flex-wrap items-center justify-between gap-2">
          {mode === "view" ? (
            <>
              <Button variant="outline" asChild>
                <PrefetchingLink href="/control-panel/patient-management">Back to list</PrefetchingLink>
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => setMode("edit")}>
                  Update profile
                </Button>
                <ConfirmActionDialog
                  trigger={
                    <Button type="button" variant="destructive" disabled={isDeleting}>
                      {isDeleting ? "Deleting…" : "Delete"}
                    </Button>
                  }
                  title="Permanently remove this patient?"
                  subtitle={
                    <>
                      This will delete{" "}
                      <span className="font-medium text-gray-800">
                        {`${patient.firstname} ${patient.lastname}`.trim()}
                        {patient.email ? ` (${patient.email})` : ""}
                      </span>{" "}
                      and all related data. You cannot undo this action.
                    </>
                  }
                  confirmLabel="Delete"
                  onConfirm={() =>
                    deletePatient(patient.id, {
                      onSuccess: () => router.push("/control-panel/patient-management"),
                    })
                  }
                />
              </div>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => setMode("view")}>
                Cancel
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" form={FORM_ID} disabled={isDeleting || isUpdating}>
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setMode("view")}>
                  Cancel
                </Button>
                <ConfirmActionDialog
                  trigger={
                    <Button type="button" variant="destructive" disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  }
                  title="Permanently remove this patient?"
                  subtitle={
                    <>
                      This will delete{" "}
                      <span className="font-medium text-gray-800">
                        {`${patient.firstname} ${patient.lastname}`.trim()}
                        {patient.email ? ` (${patient.email})` : ""}
                      </span>{" "}
                      and all related data. You cannot undo this action.
                    </>
                  }
                  confirmLabel="Delete"
                  onConfirm={() =>
                    deletePatient(patient.id, {
                      onSuccess: () => router.push("/control-panel/patient-management"),
                    })
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
