/**
 * Shared appointment detail — used by `/control-panel/appointments/[id]` (admin) and `/appointments/[id]` (doctor/patient).
 *
 * `accessLevel`:
 *   - mutate → shows AppointmentDetailForm (owner or assignee write|full)
 *   - view → read-only schema (admin viewing doctor-owned rows, dashboard assignees with read, patients)
 */

import Link from "next/link";
import { format } from "date-fns";
import type { AppointmentAccessLevel, AppointmentDetailRaw } from "@/lib/appointment-access";
import {
  appointmentDetailHref,
  categoryDetailHref,
  patientDetailHref,
} from "@/lib/entity-routes";
import { serializeAppointment, serializeCategory, serializePatient } from "@/lib/serializers";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Calendar, Clock, Lock } from "lucide-react";
import { AppointmentDetailForm } from "@/components/control-panel/AppointmentDetailForm";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  done: "default",
  pending: "secondary",
  alert: "destructive",
};

type AssigneeRow = {
  id: string;
  permission: string | null;
  status: string | null;
  invited_email: string | null;
  user: { id: string; email: string; display_name: string | null } | null;
};

export type AppointmentDetailScreenProps = {
  accessLevel: AppointmentAccessLevel;
  viewerRole: string | null;
  backHref: string;
  variant: "control-panel" | "portal";
  raw: AppointmentDetailRaw;
};

export function AppointmentDetailScreen({
  accessLevel,
  viewerRole,
  backHref,
  variant,
  raw,
}: AppointmentDetailScreenProps) {
  const appointment = serializeAppointment(raw);
  const patientData = raw.patient ? serializePatient(raw.patient) : null;
  const categoryData = raw.category ? serializeCategory(raw.category) : null;
  const canEdit = accessLevel === "mutate";

  return (
    <div className="space-y-2">
      <PageHeader
        title={appointment.title}
        description={
          variant === "control-panel"
            ? "Appointment — all table schema properties"
            : "Appointment details"
        }
        actions={
          <Button variant="outline" asChild>
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        }
      />

      {!canEdit && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-900">
          <Lock className="h-4 w-4 shrink-0" aria-hidden />
          Read-only — you can view this appointment but only the calendar owner or invited editors can
          change it.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex flex-col gap-1 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" /> Date
          </div>
          <p className="font-medium">{format(new Date(appointment.start), "PPP")}</p>
        </Card>
        <Card className="flex flex-col gap-1 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="h-4 w-4" /> Time
          </div>
          <p className="font-medium">
            {format(new Date(appointment.start), "p")} – {format(new Date(appointment.end), "p")}
          </p>
        </Card>
        <Card className="flex flex-col gap-1 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" /> Location
          </div>
          <p className="font-medium truncate">{appointment.location ?? "—"}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schema: appointments</CardTitle>
          <p className="text-sm text-muted-foreground">
            id · created_at · updated_at · start · end · location · patient · category · title · status ·
            notes · user_id · attachments
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">id</dt>
              <dd className="font-mono break-all text-xs mt-0.5">{appointment.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">user_id</dt>
              <dd className="font-mono break-all text-xs mt-0.5">{appointment.user_id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">created_at</dt>
              <dd className="mt-0.5">
                {appointment.created_at ? new Date(appointment.created_at).toLocaleString() : "—"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">updated_at</dt>
              <dd className="mt-0.5">
                {appointment.updated_at ? new Date(appointment.updated_at).toLocaleString() : "—"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">start</dt>
              <dd className="mt-0.5">
                {appointment.start ? new Date(appointment.start).toLocaleString() : "—"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">end</dt>
              <dd className="mt-0.5">
                {appointment.end ? new Date(appointment.end).toLocaleString() : "—"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">title</dt>
              <dd className="mt-0.5 font-medium">{appointment.title}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">status</dt>
              <dd className="mt-0.5">
                <Badge
                  variant={STATUS_VARIANTS[appointment.status ?? "pending"] ?? "secondary"}
                  className="capitalize"
                >
                  {appointment.status ?? "pending"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">location</dt>
              <dd className="mt-0.5">{appointment.location ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">notes</dt>
              <dd className="mt-0.5 text-muted-foreground">{appointment.notes ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">patient</dt>
              <dd className="mt-0.5">
                {patientData ? (
                  <EntityTitleLink
                    href={patientDetailHref(viewerRole, patientData.id)}
                    label={`${patientData.firstname} ${patientData.lastname}`}
                  />
                ) : (
                  (appointment.patient ?? "—")
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">category</dt>
              <dd className="mt-0.5">
                {categoryData ? (
                  <span className="flex items-center gap-2">
                    {categoryData.color && (
                      <input
                        type="color"
                        value={categoryData.color}
                        readOnly
                        disabled
                        title="Category color"
                        className="inline-block h-3 w-4 rounded border-0 p-0 cursor-default"
                      />
                    )}
                    <EntityTitleLink
                      href={categoryDetailHref(viewerRole, categoryData.id)}
                      label={categoryData.label}
                    />
                  </span>
                ) : (
                  (appointment.category ?? "—")
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-muted-foreground">attachments</dt>
              <dd className="mt-0.5">
                {appointment.attachments?.length ? (
                  <span>{appointment.attachments.length} file(s)</span>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>

          {raw.assignees?.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Assignees ({raw.assignees.length})</h4>
              <div className="space-y-1">
                {raw.assignees.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                  >
                    <span>{a.user?.display_name ?? a.user?.email ?? a.invited_email ?? "—"}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {a.permission ?? "read"}
                      </Badge>
                      <Badge
                        variant={a.status === "accepted" ? "default" : "secondary"}
                        className="text-xs capitalize"
                      >
                        {a.status ?? "pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canEdit ? (
            <AppointmentDetailForm appointment={appointment} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Open{" "}
              <EntityTitleLink
                href={appointmentDetailHref(viewerRole, appointment.id)}
                label="this appointment"
                className="inline"
              />{" "}
              from your calendar when you need to request changes from the owner.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
