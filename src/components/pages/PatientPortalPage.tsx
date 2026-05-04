"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock,
  MapPin,
  FileText,
  Plus,
  User,
  Activity,
  Stethoscope,
} from "lucide-react";
import { format, isPast, isFuture, isToday } from "date-fns";
import type { Patient, Appointment } from "@/types/types";
import { notify } from "@/lib/notify";
import { appointmentCreateSchema } from "@/lib/schemas/appointment";
import { useUsers } from "@/hooks/useUsers";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAppointmentData } from "@/lib/query-client";

interface PortalData {
  appointments: (Appointment & {
    category?: { label: string; color: string | null };
    owner?: { display_name: string | null; email: string };
  })[];
  patient: Patient | null;
  message?: string;
}

const STATUS_META: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
  done: { icon: <CalendarCheck className="h-4 w-4" />, cls: "bg-green-100 text-green-700", label: "Done" },
  pending: { icon: <CalendarClock className="h-4 w-4" />, cls: "bg-yellow-100 text-yellow-700", label: "Pending" },
  alert: { icon: <CalendarX className="h-4 w-4" />, cls: "bg-red-100 text-red-700", label: "Alert" },
};

function BookAppointmentDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const { data: usersData } = useUsers({ role: "doctor" });
  const doctors = usersData?.users ?? [];

  const bookMutation = useMutation({
    mutationFn: (body: object) =>
      apiClient("/api/patient-portal", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: async () => {
      notify.crud({
        action: "created",
        entity: "Appointment request",
        detail: "Your appointment request was submitted successfully.",
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.patientPortal.all });
      await invalidateAppointmentData(queryClient);
      setOpen(false);
      setTitle(""); setStart(""); setEnd(""); setNotes(""); setDoctorId("");
    },
    onError: (e) => handleApiError(e, "Failed to book appointment"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = appointmentCreateSchema.safeParse({
      title,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      notes: notes || "",
      status: "pending",
      patient: null,
      category: null,
      location: null,
      attachements: [],
    });
    if (!parsed.success) {
      notify.error({
        title: "Invalid appointment request",
        subtitle: parsed.error.issues[0]?.message || "Please check your date and time values.",
      });
      return;
    }
    bookMutation.mutate({ title, start, end, notes, doctorId: doctorId || undefined });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Book Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="pp-title">Title</Label>
            <Input id="pp-title" placeholder="Reason for visit" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pp-start">Start</Label>
              <Input id="pp-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pp-end">End</Label>
              <Input id="pp-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />
            </div>
          </div>
          {doctors.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="pp-doctor">Preferred Doctor (optional)</Label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger id="pp-doctor">
                  <SelectValue placeholder="Any available doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.display_name ?? d.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="pp-notes">Notes</Label>
            <Textarea id="pp-notes" placeholder="Additional notes…" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={bookMutation.isPending || !title || !start || !end}>
              {bookMutation.isPending ? "Booking…" : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentTimeline({
  appointments,
}: {
  appointments: PortalData["appointments"];
}) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  const filtered = appointments.filter((a) => {
    const d = new Date(a.start);
    if (filter === "upcoming") return isFuture(d) || isToday(d);
    if (filter === "past") return isPast(d) && !isToday(d);
    return true;
  });

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Stethoscope className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">No appointments yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your appointment history will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold">Appointment History</h3>
        <div className="flex bg-muted rounded-2xl p-1 gap-1">
          {(["all", "upcoming", "past"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${filter === f ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative space-y-2 before:absolute before:inset-y-0 before:left-5 before:w-0.5 before:bg-border">
        {filtered.map((appt) => {
          const status = appt.status ?? "pending";
          const meta = STATUS_META[status] ?? STATUS_META.pending;
          const startDate = new Date(appt.start);
          return (
            <div key={appt.id} className="relative pl-14">
              {/* Timeline dot */}
              <div className="absolute left-3 top-4 h-5 w-5 rounded-full border-2 border-background bg-muted flex items-center justify-center shadow-sm z-10">
                {meta.icon}
              </div>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{appt.title}</h4>
                        <Badge className={meta.cls}>{meta.label}</Badge>
                        {appt.category && (
                          <Badge variant="outline" className="gap-1">
                            <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" className="inline-block shrink-0">
                              <circle cx="4" cy="4" r="4" fill={appt.category.color ?? "#888"} />
                            </svg>
                            {appt.category.label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(startDate, "dd MMM yyyy, HH:mm")}
                          {" — "}
                          {format(new Date(appt.end), "HH:mm")}
                        </span>
                        {appt.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {appt.location}
                          </span>
                        )}
                        {appt.owner && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Dr. {appt.owner.display_name ?? appt.owner.email}
                          </span>
                        )}
                      </div>
                      {appt.notes && (
                        <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
                          <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                          {appt.notes}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {isToday(startDate) ? "Today" : format(startDate, "EEE, dd MMM")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No {filter} appointments.</p>
        )}
      </div>
    </div>
  );
}

export default function PatientPortalPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.patientPortal.all,
    queryFn: () => apiClient<PortalData>("/api/patient-portal"),
  });

  const patient = data?.patient ?? null;
  const appointments = data?.appointments ?? [];

  // Stats
  const done = appointments.filter((a) => a.status === "done").length;
  const upcoming = appointments.filter((a) => isFuture(new Date(a.start)) || isToday(new Date(a.start))).length;
  const total = appointments.length;

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex justify-between items-start pb-6 border-b">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <div className="md:col-span-2 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8">
        <p className="text-red-500">Error: {(error as Error)?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-7 w-7 text-gray-700" />
            Patient Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            View your appointment history and request new appointments
          </p>
        </div>
        <BookAppointmentDialog />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {/* Patient profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {patient ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-gray-700 font-semibold">
                        {`${patient.firstname[0]}${patient.lastname[0]}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{patient.firstname} {patient.lastname}</p>
                      {patient.pronoun && <p className="text-xs text-muted-foreground">{patient.pronoun}</p>}
                    </div>
                  </div>
                  <Separator />
                  <dl className="space-y-2 text-sm">
                    {patient.email && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="font-medium truncate max-w-[130px]">{patient.email}</dd>
                      </div>
                    )}
                    {patient.birth_date && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Date of Birth</dt>
                        <dd className="font-medium">{format(new Date(patient.birth_date), "dd MMM yyyy")}</dd>
                      </div>
                    )}
                    {patient.care_level != null && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Care Level</dt>
                        <dd className="font-medium">{patient.care_level}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        <Badge className={patient.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                          {patient.active ? "Active" : "Inactive"}
                        </Badge>
                      </dd>
                    </div>
                    {patient.active_since && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Since</dt>
                        <dd className="font-medium">{format(new Date(patient.active_since), "dd MMM yyyy")}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Patient ID</dt>
                      <dd className="font-mono text-xs text-muted-foreground">#{patient.id.slice(0, 8)}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  No patient record linked to your account yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Appointments</span>
                <Badge variant="outline" className="font-semibold">{total}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed</span>
                <Badge className="bg-green-100 text-green-700 font-semibold">{done}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Upcoming</span>
                <Badge className="bg-blue-100 text-blue-700 font-semibold">{upcoming}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="md:col-span-2">
          <AppointmentTimeline appointments={appointments} />
        </div>
      </div>
    </div>
  );
}
