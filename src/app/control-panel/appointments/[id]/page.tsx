/**
 * SSR: Appointment detail page.
 * Server fetches via Prisma with full relations, passes to client for editing.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializeAppointment, serializeCategory, serializePatient } from "@/lib/serializers";
import { isValidUUID } from "@/lib/validation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Calendar, Clock } from "lucide-react";
import { AppointmentDetailForm } from "@/components/control-panel/AppointmentDetailForm";
import { format } from "date-fns";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Appointment — ${id.slice(0, 8)}` };
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  done: "default",
  pending: "secondary",
  alert: "destructive",
};

export default async function AppointmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const raw = await prisma.appointment.findFirst({
    where: {
      id,
      OR: [
        { owner_id: sessionUser.userId },
        { assignees: { some: { user_id: sessionUser.userId } } },
      ],
    },
    include: {
      patient: true,
      category: true,
      assignees: {
        include: { user: { select: { id: true, email: true, display_name: true } } },
      },
    },
  });

  if (!raw) notFound();

  const appointment = serializeAppointment(raw);
  const patientData = raw.patient ? serializePatient(raw.patient) : null;
  const categoryData = raw.category ? serializeCategory(raw.category) : null;

  return (
    <div className="space-y-2">
      <PageHeader
        title={appointment.title}
        description="Appointment — all table schema properties"
        actions={
          <Button variant="outline" asChild>
            <Link href="/control-panel">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        }
      />

      {/* Quick stats */}
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
          <p className="font-medium">{format(new Date(appointment.start), "p")} – {format(new Date(appointment.end), "p")}</p>
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
            id · created_at · updated_at · start · end · location · patient · category · title · status · notes · user_id · attachments
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* All schema fields */}
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
              <dd className="mt-0.5">{appointment.created_at ? new Date(appointment.created_at).toLocaleString() : "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">updated_at</dt>
              <dd className="mt-0.5">{appointment.updated_at ? new Date(appointment.updated_at).toLocaleString() : "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">start</dt>
              <dd className="mt-0.5">{appointment.start ? new Date(appointment.start).toLocaleString() : "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">end</dt>
              <dd className="mt-0.5">{appointment.end ? new Date(appointment.end).toLocaleString() : "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">title</dt>
              <dd className="mt-0.5 font-medium">{appointment.title}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">status</dt>
              <dd className="mt-0.5">
                <Badge variant={STATUS_VARIANTS[appointment.status ?? "pending"] ?? "secondary"} className="capitalize">
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
                  <Link href={`/control-panel/patients/${patientData.id}`} className="text-gray-700 hover:underline">
                    {patientData.firstname} {patientData.lastname}
                  </Link>
                ) : (appointment.patient ?? "—")}
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
                    <Link href={`/control-panel/categories/${categoryData.id}`} className="text-gray-700 hover:underline">
                      {categoryData.label}
                    </Link>
                  </span>
                ) : (appointment.category ?? "—")}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-muted-foreground">attachments</dt>
              <dd className="mt-0.5">
                {appointment.attachments?.length ? (
                  <span>{appointment.attachments.length} file(s)</span>
                ) : "—"}
              </dd>
            </div>
          </dl>

          {/* Assignees */}
          {raw.assignees?.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Assignees ({raw.assignees.length})</h4>
              <div className="space-y-1">
                {raw.assignees.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                    <span>{a.user?.display_name ?? a.user?.email ?? a.invited_email ?? "—"}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">{a.permission ?? "read"}</Badge>
                      <Badge variant={a.status === "accepted" ? "default" : "secondary"} className="text-xs capitalize">
                        {a.status ?? "pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Edit form (client component) */}
          <AppointmentDetailForm appointment={appointment} />
        </CardContent>
      </Card>
    </div>
  );
}
