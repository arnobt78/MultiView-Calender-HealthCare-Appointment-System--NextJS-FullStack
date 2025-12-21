"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns";
import clsx from "clsx";
import {
  Appointment,
  Category,
  Patient,
  Relative,
  AppointmentAssignee,
  Activity,
} from "@/types/types";
import { getUserAppointmentPermission } from "@/lib/permissions";
// Using Vercel Blob for file storage
import { getPublicUrl } from "@/lib/vercelBlob";
import { useEffect, useState, useCallback } from "react";
import { useDateContext } from "@/context/DateContext";
import AppointmentDialog from "./AppointmentDialog";
import EditAppointmentDialog from "./EditAppointmentDialog";
import { Button } from "@/components/ui/button";
import {
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiUser,
  FiMapPin,
  FiPaperclip,
  FiFlag,
  FiUsers,
} from "react-icons/fi";
import AppointmentHoverCard from "./AppointmentHoverCard";
import { de } from "date-fns/locale";
import { useAppointmentColor } from "@/context/AppointmentColorContext";

type AppointmentWithCategory = Appointment & {
  category_data?: Category;
  patient_data?: Patient;
};

export default function MonthView() {
  const [calendarDays, setCalendarDays] = useState<
    { date: Date; appointments: AppointmentWithCategory[] }[]
  >([]);
  const { currentDate } = useDateContext();
  const [editAppt, setEditAppt] = useState<AppointmentWithCategory | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [assignees, setAssignees] = useState<AppointmentAssignee[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [ownerUsers, setOwnerUsers] = useState<{ id: string, email: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Store current userId for permission checks
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { randomBgColor } = useAppointmentColor();

  const buildCalendar = useCallback(
    (list: AppointmentWithCategory[]) => {
      const start = startOfWeek(startOfMonth(currentDate), {
        weekStartsOn: 1,
      });
      const end = endOfWeek(endOfMonth(currentDate), {
        weekStartsOn: 1,
      });
      const days: { date: Date; appointments: AppointmentWithCategory[] }[] =
        [];
      for (let d = start; d <= end; d = addDays(d, 1)) {
        days.push({
          date: new Date(d),
          appointments: list.filter((a) => isSameDay(new Date(a.start), d)),
        });
      }
      setCalendarDays(days);
    },
    [currentDate]
  );

  useEffect(() => {
    (async () => {
      // Only fetch user once
      let uid = userId;
      let email: string | null = userEmail;
      if (!uid) {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          uid = data?.user?.id || null;
          email = data?.user?.email || null;
        }
        if (!uid) return;
        setUserId(uid);
        setUserEmail(email);
      } else {
        // If userId is already set, fetch email from API
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          email = data?.user?.email || null;
          setUserEmail(email);
        }
      }
      
      try {
        // Fetch owned appointments (API automatically filters by authenticated user)
        const ownedRes = await fetch("/api/appointments");
        const ownedData = await ownedRes.json();
        const owned = ownedData.appointments || [];
        
        // Fetch categories, patients, and assignees separately for joining
        const [categoriesRes, patientsRes, allAssigneesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/patients"),
          fetch("/api/appointment-assignees"),
        ]);
        const categoriesData = await categoriesRes.json();
        const patientsData = await patientsRes.json();
        const allAssigneesData = await allAssigneesRes.json();
        const categories = categoriesData.categories || [];
        const patients = patientsData.patients || [];
        const allAssignees = allAssigneesData.assignees || [];
        
        // Join categories, patients, and assignees with appointments
        const ownedWithDetails = owned.map((appt: Appointment) => ({
          ...appt,
          category_data: categories.find((c: Category) => c.id === appt.category),
          patient_data: patients.find((p: Patient) => p.id === appt.patient),
          appointment_assignee: allAssignees.filter((a: AppointmentAssignee) => a.appointment === appt.id),
        }));

      // --- NEW: Fetch dashboard access for invited users ---
      const dashboardAccessRes = await fetch("/api/dashboard-access?status=accepted");
      const dashboardAccessData = await dashboardAccessRes.json();
      const dashboardAccess = dashboardAccessData.dashboard_access || [];
      type DashboardAccessRow = { owner_user_id: string };
      let sharedAppointments: AppointmentWithCategory[] = [];
      if (dashboardAccess && dashboardAccess.length > 0) {
        const ownerIds = (dashboardAccess as DashboardAccessRow[]).map((d) => d.owner_user_id).filter(Boolean);
        // Note: Current API filters by authenticated user, so we can't fetch other users' appointments directly
        // This would require a new API route that allows fetching by owner_user_id with proper permissions
        // For now, we'll skip shared appointments from dashboard access
      }

      // Fetch assigned appointments by user and email
      const assignedByUser = allAssignees.filter(
        (a: AppointmentAssignee) => a.user === uid && a.status === "accepted"
      );
      const assignedByEmail = email
        ? allAssignees.filter(
            (a: AppointmentAssignee) => a.invited_email === email && a.status === "accepted"
          )
        : [];

      // Fetch appointment data for assigned appointments
      const assignedAppointmentIds = [
        ...assignedByUser.map((a: AppointmentAssignee) => a.appointment),
        ...assignedByEmail.map((a: AppointmentAssignee) => a.appointment),
      ].filter(Boolean);
      const uniqueAppointmentIds = [...new Set(assignedAppointmentIds)];

      const assignedAppointmentsData = await Promise.all(
        uniqueAppointmentIds.map(async (apptId: string) => {
          const res = await fetch(`/api/appointments/${apptId}`);
          if (res.ok) {
            const data = await res.json();
            return data.appointment;
          }
          return null;
        })
      );

      // Merge assigned appointments with assignee data
      type AppointmentWithAssignees = AppointmentWithCategory & { appointment_assignee?: AppointmentAssignee[] };
      const assignedAppointments: AppointmentWithAssignees[] = assignedAppointmentsData
        .filter(Boolean)
        .map((appt: Appointment) => {
          const relatedAssignees = [
            ...assignedByUser.filter((a: AppointmentAssignee) => a.appointment === appt.id),
            ...assignedByEmail.filter((a: AppointmentAssignee) => a.appointment === appt.id),
          ].filter((a) => typeof a.permission === "string" && ["read", "write", "full"].includes(a.permission));
          
          return {
            ...appt,
            category_data: categories.find((c: Category) => c.id === appt.category),
            patient_data: patients.find((p: Patient) => p.id === appt.patient),
            appointment_assignee: relatedAssignees,
          };
        });
      // Merge and deduplicate, always include all assignees for each appointment
      const allAppointments: AppointmentWithAssignees[] = [...ownedWithDetails, ...sharedAppointments, ...assignedAppointments].map((appt) => ({ ...appt }));
      const deduped: AppointmentWithAssignees[] = allAppointments.reduce((acc: AppointmentWithAssignees[], curr: AppointmentWithAssignees) => {
        if (!curr || !curr.id) return acc;
        const existing = acc.find((a) => a.id === curr.id);
        if (existing) {
          existing.appointment_assignee = [
            ...(existing.appointment_assignee || []),
            ...(curr.appointment_assignee || [])
          ].filter((v, i, arr) => v && v.id && arr.findIndex((b) => b.id === v.id) === i);
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
      if (deduped) buildCalendar(deduped as AppointmentWithCategory[]);

      // Collect all unique user IDs from appointments and dashboard_access to get owner emails
      const allUserIds = new Set<string>();
      ownedWithDetails.forEach((appt: Appointment) => {
        if (appt.user_id) allUserIds.add(appt.user_id);
      });
      assignedAppointments.forEach((appt: Appointment) => {
        if (appt.user_id) allUserIds.add(appt.user_id);
      });
      // Also add owner_user_id from dashboardAccess for invited dashboard appointments
      if (dashboardAccess && dashboardAccess.length > 0) {
        (dashboardAccess as { owner_user_id: string }[]).forEach(d => {
          if (d.owner_user_id) allUserIds.add(d.owner_user_id);
        });
      }

      // Fetch user data for all owners (using search API)
      const ownerUsersPromises = Array.from(allUserIds).map(async (userId: string) => {
        const res = await fetch(`/api/users/search?query=${userId}`);
        if (res.ok) {
          const data = await res.json();
          const user = data.users?.find((u: { id: string }) => u.id === userId);
          return user ? { id: user.id, email: user.email } : null;
        }
        return null;
      });
      const ownerUsersResults = await Promise.all(ownerUsersPromises);
      const allOwnerUsers = ownerUsersResults.filter(Boolean) as { id: string; email: string }[];

      setOwnerUsers(allOwnerUsers || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    })();
  }, [currentDate, buildCalendar, userId, userEmail]);

  // Helper: get permission for current user on an appointment
  // Use shared permission helper
  function getUserPermission(
    appt: AppointmentWithCategory & { appointment_assignee?: AppointmentAssignee[] },
    uid: string | null
  ): "owner" | "full" | "write" | "read" | null {
    return getUserAppointmentPermission({
      appointment: appt,
      assignees: appt.appointment_assignee,
      userId: uid,
    });
  }

  useEffect(() => {
    // Fetch all patients, relatives, assignees, and activities for mapping
    (async () => {
      try {
        const [patsRes, relsRes, assignsRes, actsRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/relatives"),
          fetch("/api/appointment-assignees"),
          fetch("/api/activities"),
        ]);
        const patsData = await patsRes.json();
        const relsData = await relsRes.json();
        const assignsData = await assignsRes.json();
        const actsData = await actsRes.json();
        setPatients(patsData.patients || []);
        setRelatives(relsData.relatives || []);
        setAssignees(assignsData.assignees || []);
        setActivities(actsData.activities || []);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    })();
  }, []);

  const toggleStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setCalendarDays((prev) =>
          prev.map((d) => ({
            ...d,
            appointments: d.appointments.map((a) =>
              a.id === id ? { ...a, status: newStatus as typeof a.status } : a
            ),
          }))
        );
      } else {
        console.error("Failed to update appointment status");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const deleteAppt = async (id: string) => {
    if (!confirm("Termin wirklich löschen?")) return;
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCalendarDays((prev) =>
          prev.map((d) => ({
            ...d,
            appointments: d.appointments.filter((a) => a.id !== id),
          }))
        );
      } else {
        console.error("Failed to delete appointment");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  // Helper: sort appointments by start time ascending
  const sortByTime = (appts: AppointmentWithCategory[]) =>
    [...appts].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

  // Helper: is today
  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  // Helper for Heute/Demnächst/Einen Tag später/Datum überschritten tag
  function getDateTag(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0)
      return (
        <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
          Heute
        </span>
      );
    if (diffDays === 1)
      return (
        <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
          Demnächst
        </span>
      );
    if (diffDays > 1)
      return (
        <span className="ml-2 px-2 py-0.5 rounded bg-sky-100 text-sky-700 text-xs font-medium">
          Einen Tag später
        </span>
      );
    if (diffDays < 0)
      return (
        <span className="ml-2 px-2 py-0.5 rounded bg-gray-200 text-gray-500 text-xs font-medium">
          Datum überschritten
        </span>
      );
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row p-6 sm:p-8 space-y-4 md:space-y-0 md:space-x-8 bg-[#f5f5f6] min-h-[calc(100vh-80px)]">
      <div className="flex-1">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-800 mb-2">
          Monatsansicht
        </h2>
        <div className="grid grid-cols-7 gap-px bg-gray-200 text-sm">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
            <div
              key={d}
              className="bg-white p-2 font-medium text-gray-600 text-center border-b border-gray-200"
            >
              {d}
            </div>
          ))}
          {calendarDays.map(({ date, appointments }) => {
            const selected = selectedDate && isSameDay(date, selectedDate);
            const isCurrent = isToday(date);
            const hasAppointments = appointments.length > 0;
            return (
              <div
                key={date.toISOString()}
                className={clsx(
                  "min-h-[100px] p-2 border bg-white relative group transition",
                  !isSameMonth(date, currentDate) && "bg-gray-100 text-gray-400",
                  isCurrent && !selected && "bg-green-100",
                  selected && "bg-gray-200 border-green-600 border-2 z-10",
                  !selected && "border-gray-200",
                  hasAppointments ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => hasAppointments && setSelectedDate(date)}
              >
                <div className="flex items-center mb-1">
                  <span
                    className={clsx(
                      "text-xs font-semibold text-gray-700 w-6 h-6 flex items-center justify-center rounded",
                      selected && "bg-green-500 text-white",
                      !selected && isCurrent && "bg-green-200 text-green-700"
                    )}
                  >
                    {format(date, "d")}
                  </span>
                </div>
                <div className="space-y-1">
                  {appointments.map((a) => {
                    // Filter assignees for this specific appointment
                    const appointmentAssignees = assignees.filter((ass) => ass.appointment === a.id);

                    return (
                      <AppointmentHoverCard
                        key={a.id}
                        appointment={a}
                        patients={patients}
                        relatives={relatives}
                        assignees={appointmentAssignees}
                        activities={activities}
                        userEmail={userEmail}
                        userId={userId}
                        ownerUsers={ownerUsers}
                        getDateTag={getDateTag}
                        onEdit={setEditAppt}
                        onDelete={deleteAppt}
                        onToggleStatus={toggleStatus}
                        showDetails={false} // Default to false, can be overridden
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side list for selected date */}
      {selectedDate && (
        <div className="w-full md:w-[350px] bg-white rounded-xl shadow-lg p-2 h-fit sticky top-41">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-green-700 text-white rounded px-2 py-1 text-lg font-bold">
              {format(selectedDate, "d")}
            </span>
            <span className="text-lg font-semibold text-gray-800">
              {format(selectedDate, "EEEE, dd. MMMM", { locale: de })}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
              onClick={() => setSelectedDate(null)}
            >
              Schließen
            </Button>
          </div>
          <div className="space-y-4">
            {sortByTime(
              calendarDays.find((d) => isSameDay(d.date, selectedDate))
                ?.appointments || []
            ).map((a) => {
              const color = a.category_data?.color || randomBgColor(a.id);
              const isDone = a.status === "done";

              // Deduplicate assignees by user + invited_email
              const filteredAssignees = assignees.filter((ass) => ass.appointment === a.id);
              const dedupedMap = new Map();
              for (const ass of filteredAssignees) {
                const key = `${ass.user || ''}|${ass.invited_email || ''}`;
                if (!dedupedMap.has(key)) {
                  dedupedMap.set(key, ass);
                } else {
                  // Prefer accepted over pending, prefer higher permission
                  const prev = dedupedMap.get(key) as AppointmentAssignee;
                  const statusOrder: Record<'accepted' | 'pending', number> = { accepted: 2, pending: 1 };
                  const permOrder: Record<'full' | 'write' | 'read', number> = { full: 3, write: 2, read: 1 };
                  // Type guards for status and permission
                  const isValidStatus = (s: unknown): s is 'accepted' | 'pending' => s === 'accepted' || s === 'pending';
                  const isValidPerm = (p: unknown): p is 'full' | 'write' | 'read' => p === 'full' || p === 'write' || p === 'read';
                  const prevStatus = isValidStatus(prev.status) ? statusOrder[prev.status] : 0;
                  const currStatus = isValidStatus(ass.status) ? statusOrder[ass.status] : 0;
                  const prevPerm = isValidPerm(prev.permission) ? permOrder[prev.permission] : 0;
                  const currPerm = isValidPerm(ass.permission) ? permOrder[ass.permission] : 0;
                  if (
                    currStatus > prevStatus ||
                    (currStatus === prevStatus && currPerm > prevPerm)
                  ) {
                    dedupedMap.set(key, ass);
                  }
                }
              }
              const dedupedAssignees = Array.from(dedupedMap.values());

              return (
                <div
                  key={a.id}
                  className={clsx(
                    "relative border rounded-xl shadow bg-white p-0 flex items-stretch transition hover:shadow-lg min-h-[110px]",
                    isDone && "bg-gray-100 opacity-60"
                  )}
                >
                  {/* Color bar */}
                  <div
                    className="w-2 rounded-l-xl h-full absolute left-0 top-0 bottom-0"
                    style={{ backgroundColor: color }}
                  />
                  {/* Main content */}
                  <div className="pl-6 pr-2 py-4 flex-1 flex flex-col justify-center min-h-[110px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-semibold text-gray-800 flex items-center">
                        {a.title}
                        {getDateTag(new Date(a.start))}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-1">
                      <span className="flex items-center gap-1">
                        <FiFileText />
                        {format(new Date(a.start), "dd.MM.yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiFlag />
                        {format(new Date(a.start), "HH:mm")} –{" "}
                        {format(new Date(a.end), "HH:mm")}
                      </span>
                    </div>

                    {a.notes && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-1 ">
                        <span className="flex-shrink-0 flex items-center justify-center">
                          <FiFileText className="w-4 h-4" />
                        </span>
                        <span className="text-xs text-gray-700 break-words">
                          {a.notes}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-400 italic mb-1">
                      <FiUser /> Klient:{" "}
                      <span className="not-italic text-gray-700">
                        {a.patient && patients.length > 0
                          ? (() => {
                            const p = patients.find(
                              (x) => x.id === a.patient
                            );
                            return p ? `${p.firstname} ${p.lastname}` : "--";
                          })()
                          : "--"}
                      </span>
                    </div>

                    {a.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 italic mb-1">
                        <FiMapPin /> Ort:{" "}
                        <span className="not-italic text-gray-700">
                          {a.location}
                        </span>
                      </div>
                    )}

                    {a.attachements && a.attachements.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <FiPaperclip /> Anhänge:
                        {a.attachements.map((file, idx) => {
                          // Get Vercel Blob public URL
                          const publicUrl = getPublicUrl(file);
                          const fileName = file.split("/").pop() || file;
                          return publicUrl ? (
                            <a
                              key={idx}
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="not-italic text-blue-700 underline"
                            >
                              {fileName}
                            </a>
                          ) : (
                            <span key={idx} className="text-red-600">
                              [Fehler: Datei nicht gefunden]
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <FiFlag /> Status:{" "}
                      <span className="not-italic text-gray-700">
                        {a.status}
                      </span>
                    </div>

                    {/* Refer to: patient name from appointment.patient field */}
                    {a.patient && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <FiUsers /> Refer to:
                        {(() => {
                          try {
                            // Debug: Log the patient data (development only)
                            if (process.env.NODE_ENV === "development") {
                              console.log('DEBUG - MonthView Patient data:', {
                                patient: a.patient,
                                patientType: typeof a.patient,
                                isObject: typeof a.patient === 'object',
                                hasFirstname: a.patient && typeof a.patient === 'object' && 'firstname' in a.patient,
                                hasLastname: a.patient && typeof a.patient === 'object' && 'lastname' in a.patient
                              });
                            }

                            // If patient is already an object with firstname/lastname
                            if (a.patient &&
                              typeof a.patient === 'object' &&
                              'firstname' in a.patient &&
                              'lastname' in a.patient) {
                              const patientObj = a.patient as Patient;
                              return (
                                <span className="not-italic text-purple-700">
                                  Patient: {patientObj.firstname} {patientObj.lastname}
                                </span>
                              );
                            }

                            // If patient is a string ID and patients are loaded
                            if (typeof a.patient === 'string' && patients.length > 0) {
                              const patient = patients.find((p) => p.id === a.patient);
                              if (patient && patient.firstname && patient.lastname) {
                                return (
                                  <span className="not-italic text-purple-700">
                                    Patient: {patient.firstname} {patient.lastname}
                                  </span>
                                );
                              }
                            }

                            // Fallback
                            return (
                              <span className="not-italic text-red-700">
                                Patient data not available
                              </span>
                            );
                          } catch (error) {
                            console.error('Error in MonthView patient lookup:', error);
                            return (
                              <span className="not-italic text-red-700">
                                Error loading patient
                              </span>
                            );
                          }
                        })()}
                      </div>
                    )}

                    {dedupedAssignees.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <FiUsers /> Assigned by:
                        {a.user_id === userId ? (
                          // Owner view
                          <span className="not-italic text-green-700">
                            you ({userEmail || "owner"})
                          </span>
                        ) : (
                          // Invitee view: show owner's email
                          <span className="not-italic text-blue-700">
                            {(() => {
                              // Debug: Log ownerUsers and appointment user_id mapping (development only)
                              if (process.env.NODE_ENV === "development") {
                                console.log('[MonthView Assigned by] ownerUsers:', ownerUsers, 'appointment user_id:', a.user_id);
                              }
                              const owner = ownerUsers.find(u => u.id === a.user_id);
                              return owner?.email || a.user_id;
                            })()}
                          </span>
                        )}
                      </div>
                    )}

                    {activities.length > 0 && (
                      <div className="flex flex-col gap-1 text-xs text-gray-400 mb-1">
                        <span>Aktivitäten:</span>
                        {activities
                          .filter((act) => act.appointment === a.id)
                          .map((act, idx) => (
                            <span
                              key={idx}
                              className="not-italic text-pink-700"
                            >
                              {act.type}: {act.content}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col items-center gap-3 min-w-[56px] py-4 px-2 justify-center">
                    {/* Status checkbox - only show if user is owner, full, or write permission */}
                    {(() => {
                      // Check if user is the owner
                      const isOwner = a.user_id === userId;

                      // Get user permission from assignees if not owner
                      let userPermission: "full" | "write" | "read" | null = null;

                      if (!isOwner && dedupedAssignees && dedupedAssignees.length > 0) {
                        // Find the current user's assignment
                        const userAssignment = dedupedAssignees.find(
                          (ass) =>
                            (ass.user === userId || ass.invited_email === userId) &&
                            ass.appointment === a.id &&
                            ass.status === "accepted"
                        );
                        userPermission = userAssignment?.permission || null;

                        // Debug logging (development only)
                        if (process.env.NODE_ENV === "development") {
                          console.log('DEBUG - MonthView Sidebar Permission Check:', {
                            appointmentId: a.id,
                            userId: userId,
                            userEmail: userEmail,
                            dedupedAssignees: dedupedAssignees,
                            userAssignment: userAssignment,
                            userPermission: userPermission,
                            isOwner: isOwner
                          });
                        }
                      }

                      // Only owner, full, or write can toggle status
                      if (isOwner || userPermission === "full" || userPermission === "write") {
                        return (
                          <label className="flex flex-col items-center gap-1">
                            <input
                              type="checkbox"
                              className="mb-1 accent-green-600 w-5 h-5 cursor-pointer"
                              checked={isDone}
                              onChange={() =>
                                toggleStatus(a.id, isDone ? "pending" : "done")
                              }
                            />
                            <span className="text-xs text-gray-500 select-none">
                              {isDone ? "Erledigt" : "Offen"}
                            </span>
                          </label>
                        );
                      }
                      return null;
                    })()}

                    {/* Edit button - only show if user is owner or has full permission */}
                    {(() => {
                      // Check if user is the owner
                      const isOwner = a.user_id === userId;

                      // Get user permission from assignees if not owner
                      let userPermission: "full" | "write" | "read" | null = null;

                      if (!isOwner && dedupedAssignees && dedupedAssignees.length > 0) {
                        // Find the current user's assignment
                        const userAssignment = dedupedAssignees.find(
                          (ass) =>
                            (ass.user === userId || ass.invited_email === userId) &&
                            ass.appointment === a.id &&
                            ass.status === "accepted"
                        );
                        userPermission = userAssignment?.permission || null;

                        // Debug logging for edit button (development only)
                        if (process.env.NODE_ENV === "development") {
                          console.log('DEBUG - MonthView Sidebar Edit Permission:', {
                            appointmentId: a.id,
                            userId: userId,
                            userEmail: userEmail,
                            userPermission: userPermission,
                            canEdit: isOwner || userPermission === "full"
                          });
                        }
                      }

                      // Only owner or full can edit
                      if (isOwner || userPermission === "full") {
                        return (
                          <Button
                            size="icon"
                            variant="outline"
                            className="rounded-full border-gray-300 cursor-pointer"
                            onClick={() => setEditAppt(a)}
                            aria-label="Bearbeiten"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Button>
                        );
                      }
                      return null;
                    })()}

                    {/* Delete button - only show if user is owner or has full permission */}
                    {(() => {
                      // Check if user is the owner
                      const isOwner = a.user_id === userId;

                      // Get user permission from assignees if not owner
                      let userPermission: "full" | "write" | "read" | null = null;

                      if (!isOwner && dedupedAssignees && dedupedAssignees.length > 0) {
                        // Find the current user's assignment
                        const userAssignment = dedupedAssignees.find(
                          (ass) =>
                            (ass.user === userId || ass.invited_email === userId) &&
                            ass.appointment === a.id &&
                            ass.status === "accepted"
                        );
                        userPermission = userAssignment?.permission || null;
                      }

                      // Only owner or full can delete
                      if (isOwner || userPermission === "full") {
                        return (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full cursor-pointer"
                            onClick={() => deleteAppt(a.id)}
                            aria-label="Löschen"
                          >
                            <FiTrash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              );
            })}
            {(calendarDays.find((d) => isSameDay(d.date, selectedDate))
              ?.appointments.length || 0) === 0 && (
                <div className="text-gray-400 text-center">Keine Termine</div>
              )}
          </div>
        </div>
      )}

      {/* Edit dialog */}
      {editAppt && (
        <EditAppointmentDialog
          appointment={editAppt}
          onSuccess={() => {
            setEditAppt(null);
          }}
          trigger={null}
          refreshAppointments={async () => {
            try {
              const response = await fetch("/api/appointments");
              if (response.ok) {
                const data = await response.json();
                const appointments = data.appointments || [];
                // Fetch categories and join
                const categoriesRes = await fetch("/api/categories");
                const categoriesData = await categoriesRes.json();
                const categories = categoriesData.categories || [];
                const appointmentsWithCategories = appointments.map((appt: Appointment) => ({
                  ...appt,
                  category_data: categories.find((c: Category) => c.id === appt.category),
                }));
                buildCalendar(appointmentsWithCategories as AppointmentWithCategory[]);
              }
            } catch (error) {
              console.error("Error refreshing appointments:", error);
            }
          }}
        />
      )}
    </div>
  );
}