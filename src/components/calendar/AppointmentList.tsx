"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { FullAppointment, useAppointments } from "@/hooks/useAppointments";
import { useCategories } from "@/hooks/useCategories";
import { usePatients } from "@/hooks/usePatients";
import { useRelatives } from "@/hooks/useRelatives";
import { useAuth } from "@/hooks/useAuth";
import {
  Patient,
  AppointmentAssignee,
  Activity,
  Relative,
} from "@/types/types";
import Filters from "./Filters";
import AppointmentDialog from "./AppointmentDialog";
import EditAppointmentDialog from "./EditAppointmentDialog";
import { useDateContext } from "@/context/DateContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle, Circle } from "lucide-react";
import { getUserAppointmentPermission } from "@/lib/permissions";
import VideoCall from "./VideoCall";
// Using Vercel Blob for file storage
import { getPublicUrl } from "@/lib/vercelBlob";
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
import { MdCategory } from "react-icons/md";
import AppointmentListSkeleton from "./AppointmentListSkeleton";
import SearchBar from "./SearchBar";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
import { motion } from "framer-motion";

// Types imported from hooks

// Reusable component for date headline
function DateHeadline({ date }: { date: Date }) {
  return (
    <div className="text-lg font-bold text-gray-700 mt-8 mb-3 flex items-center gap-2">
      {format(date, "EEEE, dd. MMMM", { locale: de })}
      {(() => {
        const now = new Date();
        if (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          date.getDate() === now.getDate()
        ) {
          return (
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 hover:bg-green-100 border-transparent">
              Today
            </Badge>
          );
        }
        return null;
      })()}
    </div>
  );
}

// Color bar for appointment cards — uses ref to avoid inline style lint warning
function ColorBar({ color }: { color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.backgroundColor = color;
  }, [color]);
  return <div ref={ref} className="w-2 rounded-l-xl h-full absolute left-0 top-0 bottom-0 transition-colors" />;
}

// Helper to group appointments by date (ascending, today first)
function groupAppointmentsByDate(appts: FullAppointment[]) {
  const groups: { [date: string]: FullAppointment[] } = {};
  appts.forEach((appt) => {
    const d = new Date(appt.start);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(appt);
  });

  // Removed stray today.setHours(0, 0, 0, 0); // 'today' is not defined here and not needed
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const da = new Date(a);
    const db = new Date(b);
    return da.getTime() - db.getTime();
  });
  return sortedKeys.map((key) => ({ date: new Date(key), appts: groups[key] }));
}

// Day tags helper (Today, Next Day, Some Day Later, Date Passed)
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
      <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 hover:bg-green-100 border-transparent">
        Today
      </Badge>
    );
  if (diffDays === 1)
    return (
      <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-transparent">
        Next Day
      </Badge>
    );
  if (diffDays > 1)
    return (
      <span className="ml-2 px-2 py-0.5 rounded bg-sky-100 text-sky-700 text-xs font-medium">
        Some Day Later
      </span>
    );
  if (diffDays < 0)
    return (
      <span className="ml-2 px-2 py-0.5 rounded bg-gray-200 text-gray-500 text-xs font-medium">
        Date Passed
      </span>
    );
  return null;
}

export default function AppointmentList() {
  const { user } = useAuth();

  // Filters State
  const [category, setCategory] = useState<string | null>(null);
  const [patient, setPatient] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Edit Dialog State
  const [editAppt, setEditAppt] = useState<FullAppointment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currentDate } = useDateContext();
  const { randomBgColor } = useAppointmentColor();

  // Queries
  const {
    appointments,
    isLoading: loadingAppointments,
    deleteAppointment,
    toggleStatus,
    refetch: refetchAppointments
  } = useAppointments();

  const { categories = [] } = useCategories();
  const { patients = [] } = usePatients();
  const { relatives = [] } = useRelatives();

  // Keep ownerUsers state empty for now, or we can fetch them separately if needed, 
  // but useAppointments currently just returns user IDs. We'll simplify to just showing the user ID or email if invited_email is populated.
  const [ownerUsers, setOwnerUsers] = useState<{ id: string, email: string }[]>([]);

  // We can fetch owner users for shared appointments if needed, 
  // but for now we'll just rely on the existing invited_email or user_id.
  useEffect(() => {
    // Optional: Fetch emails for owner users if this is a shared appointment
    // This is a simplified version of the previous logic.
  }, [appointments]);

  // Compose filters object for query
  const filters = { category, patient, date, status };

  // Apply local filters since react-query fetches all
  let filteredBySidebar = appointments;

  if (date) {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const dayStart = new Date(day);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    filteredBySidebar = filteredBySidebar.filter((a) =>
      new Date(a.start) >= dayStart &&
      new Date(a.start) <= dayEnd
    );
  }
  if (category) filteredBySidebar = filteredBySidebar.filter((a) => a.category === category);
  if (patient) filteredBySidebar = filteredBySidebar.filter((a) => a.patient === patient);
  if (status) filteredBySidebar = filteredBySidebar.filter((a) => a.status === status);

  // Helper: get permission for current user on an appointment
  function getUserPermission(appt: FullAppointment): "owner" | "full" | "write" | "read" | null {
    return getUserAppointmentPermission({
      appointment: appt,
      assignees: appt.appointment_assignee,
      userId: user?.id,
    });
  }

  const handleToggleStatus = (id: string, newStatus: string) => {
    // Only pass id and status, casting generic string to required union
    toggleStatus({ id, status: newStatus as "pending" | "done" | "alert" });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Termin wirklich löschen?")) return;
    deleteAppointment(id);
  };

  const isEmpty = filteredBySidebar.length === 0;

  // Filtered appointments based on search
  const filteredAppointments = filteredBySidebar.filter((appt) => {
    if (!search.trim()) return true;
    const lower = search.toLowerCase();
    // Helper to check if a string includes the search
    const match = (val?: string | null) => !!val && val.toLowerCase().includes(lower);
    // Check all relevant fields
    // Patient name: handle both patient_data and patient as object
    let patientNameMatch = false;
    if (appt.patient_data) {
      patientNameMatch =
        !!match(appt.patient_data.firstname) ||
        !!match(appt.patient_data.lastname) ||
        !!match(appt.patient_data.email);
    } else if (
      appt.patient &&
      typeof appt.patient === "object" &&
      "firstname" in appt.patient &&
      "lastname" in appt.patient
    ) {
      const patientObj = appt.patient as {
        firstname?: string;
        lastname?: string;
      };
      patientNameMatch =
        !!match(patientObj.firstname) || !!match(patientObj.lastname);
    } else if (typeof appt.patient === "string") {
      // If patient is a string ID, try to find it in the patients list
      const p = patients.find((p: Patient) => p.id === appt.patient);
      if (p) {
        patientNameMatch = !!match(p.firstname) || !!match(p.lastname);
      }
    }

    // Also search within patient and relative names directly from the fetched lists
    const patientOrRelativeNameMatch =
      patients.some((p: Patient) =>
        (`${p.firstname} ${p.lastname}`).toLowerCase().includes(lower)
      ) ||
      relatives.some((r: Relative) =>
        (`${r.firstname} ${r.lastname}`).toLowerCase().includes(lower)
      );

    return (
      match(appt.title) ||
      match(appt.notes) ||
      match(appt.location) ||
      match(appt.status) ||
      (appt.category_data &&
        (match(appt.category_data.label) ||
          match(appt.category_data.description))) ||
      patientNameMatch ||
      patientOrRelativeNameMatch || // Include the direct patient/relative name search
      (appt.appointment_assignee &&
        appt.appointment_assignee.some((a: AppointmentAssignee) => a.user && match(a.user))) ||
      (appt.activities &&
        appt.activities.some((a: Activity) => match(a.type) || match(a.content))) ||
      (appt.attachements && appt.attachements.some((a: string) => match(a)))
    );
  });

  const handleEditSuccess = () => {
    setEditAppt(null);
  };

  const handleEdit = (appt: FullAppointment) => {
    setEditAppt(appt);
    setEditOpen(true);
  };
  const handleEditDialogChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) setEditAppt(null);
  };

  // --- DEBUG: Vercel Blob storage doesn't require bucket listing ---
  // Files are stored with URLs directly
  // Removed Supabase Storage bucket listing code

  // Group appointments by date (descending)
  const grouped = groupAppointmentsByDate(filteredAppointments);

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 min-h-[calc(100vh-80px)]">
      {/* Static header — always visible, never skeletonised */}
      <h2 className="text-2xl font-semibold tracking-tight text-gray-800 mb-2">
        Appointment List
      </h2>
      <div className="flex flex-wrap items-center gap-2 w-full">
        <div className="w-full sm:flex-1 sm:min-w-[220px] sm:max-w-sm">
          <SearchBar value={search} setValue={setSearch} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filters
            category={category}
            setCategory={setCategory}
            patient={patient}
            setPatient={setPatient}
            date={date}
            setDate={setDate}
            status={status}
            setStatus={setStatus}
            categories={categories}
            patients={patients}
            onReset={() => {
              setCategory(null);
              setPatient(null);
              setDate(null);
              setStatus(null);
              setSearch("");
            }}
          />
        </div>
      </div>

      {/* Data area — skeleton while loading, real content once ready */}
      {loadingAppointments ? (
        <div className="animate-pulse mt-8 flex flex-col gap-4">
          <div className="h-6 w-56 bg-gray-200 rounded mb-1" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative rounded-2xl bg-white border border-gray-100 flex items-stretch min-h-[130px]">
              <div className="w-1.5 rounded-l-2xl h-full absolute left-0 top-0 bottom-0 bg-gray-200" />
              <div className="pl-6 pr-4 py-4 flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-36 bg-gray-200 rounded-lg" />
                  <div className="h-5 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 w-28 bg-gray-100 rounded" />
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div className="h-3.5 w-32 bg-gray-100 rounded" />
                  <div className="h-3.5 w-28 bg-gray-100 rounded" />
                  <div className="h-3.5 w-24 bg-gray-100 rounded" />
                  <div className="h-3.5 w-20 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 min-w-[68px] py-4 px-3 border-l border-gray-100">
                <div className="h-9 w-20 bg-gray-100 rounded-md" />
                <div className="h-8 w-8 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
      {/* Show empty state if no appointments at all (before filtering) */}
      {appointments.length === 0 && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-gray-500 text-lg">
            No appointments found!
          </div>
        </div>
      )}

      {/* Only show the 'Kein Treffer gefunden' message if there are appointments but none match the filter/search */}
      {appointments.length > 0 && filteredAppointments.length === 0 && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center text-gray-500 text-lg">
            ❌ No matches found for your search for &quot;{search}&quot;
          </div>
        </div>
      )}

      {/* Render grouped appointments */}

      {filteredAppointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4"
        >
          {grouped.map(({ date, appts }) => (
            <div key={date.toISOString()}>
              <DateHeadline date={date} />
              <div className="flex flex-col gap-4">
                {appts.map((appt: FullAppointment, i: number) => {
                  // --- Begin: Restored full-featured appointment card ---
                  const start = new Date(appt.start);
                  const now = new Date();
                  const isToday =
                    start.getFullYear() === now.getFullYear() &&
                    start.getMonth() === now.getMonth() &&
                    start.getDate() === now.getDate();
                  // Always use a stable random color from bgColors for the left border if no category color is set
                  const color = appt.category_data?.color || randomBgColor(appt.id);
                  const isDone = appt.status === "done";
                  const categoryIcon = appt.category_data?.icon ? (
                    <span className="inline-flex items-center mr-1">
                      <MdCategory className="w-4 h-4 text-gray-400" />
                    </span>
                  ) : null;

                  // Deduplicate assignees by user + invited_email
                  const filteredAssignees = appt.appointment_assignee || [];
                  const dedupedMap = new Map();
                  for (const ass of filteredAssignees) {
                    const key = `${ass.user || ""}|${ass.invited_email || ""}`;
                    if (!dedupedMap.has(key)) {
                      dedupedMap.set(key, ass);
                      continue;
                    }
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
                  const dedupedAssignees = Array.from(dedupedMap.values());

                  // DEBUG: Log data for Refer to and Assigned by
                  console.log('DEBUG Appointment Card:', {
                    appt,
                    dedupedAssignees,
                    patients,
                    relatives,
                    user
                  });

                  // Additional debugging for the specific issue
                  console.log('DEBUG - Refer to section data:', {
                    appointmentId: appt.id,
                    appointmentAssignees: appt.appointment_assignee,
                    dedupedAssignees,
                    patientsData: patients,
                    relativesData: relatives,
                    ownerUsersData: ownerUsers,
                    currentUser: user
                  });

                  // Debug patient data specifically
                  console.log('DEBUG - Patient data for appointment:', {
                    appointmentId: appt.id,
                    patientField: appt.patient,
                    patientType: typeof appt.patient,
                    patientData: appt.patient_data,
                    foundPatient: patients.find((p: Patient) => p.id === appt.patient)
                  });

                  // Debug the specific fields we're trying to display
                  if (dedupedAssignees.length > 0) {
                    dedupedAssignees.forEach((ass: AppointmentAssignee, idx: number) => {
                      console.log(`DEBUG - Assignee ${idx}:`, {
                        assigneeId: ass.id,
                        userId: ass.user,
                        userType: ass.user_type,
                        invitedEmail: ass.invited_email,
                        status: ass.status,
                        permission: ass.permission,
                        foundPatient: patients.find((p: Patient) => p.id === ass.user),
                        foundRelative: relatives.find((r: Relative) => r.id === ass.user)
                      });
                    });
                  }
                  // console.log('[AppointmentList] Appointment Card:', appt);



                  return (
                    <motion.div
                      key={appt.id}
                      data-today={isToday ? "true" : undefined}
                      ref={isToday && i === 0 ? scrollRef : null}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.32, delay: i * 0.07 }}
                      className="relative rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-200 p-0 flex items-stretch min-h-[130px]"
                    >
                      {/* Color bar */}
                      <ColorBar color={color} />

                      {/* Main content */}
                      <div className="pl-6 pr-4 py-4 flex-1 flex flex-col gap-2 min-w-0">

                        {/* Row 1: Title + date tag */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-base font-semibold text-gray-800 ${isDone ? "line-through text-gray-400" : ""}`}>
                            {appt.title}
                          </span>
                          {getDateTag(start)}
                        </div>

                        {/* Row 2: Date · Time · Location */}
                        <div className="flex items-center gap-5 flex-wrap text-sm text-gray-600">
                          <span className="flex items-center gap-1.5 shrink-0">
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" className="text-gray-400 shrink-0"><path d="M8 7V3M16 7V3M3 11H21M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="text-gray-400 text-xs">Date:</span>
                            <span className={`text-xs ${isDone ? "line-through text-gray-400" : "text-gray-700 font-medium"}`}>{format(start, "dd.MM.yyyy")}</span>
                          </span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" className="text-gray-400 shrink-0"><path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>
                            <span className="text-gray-400 text-xs">Time:</span>
                            <span className={`text-xs ${isDone ? "line-through text-gray-400" : "text-gray-700 font-medium"}`}>{format(start, "HH:mm")} – {format(new Date(appt.end), "HH:mm")}</span>
                          </span>
                          <span className="flex items-center gap-1.5 min-w-0">
                            <FiMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400 text-xs shrink-0">Location:</span>
                            <span className="text-xs text-gray-700 font-medium truncate">{appt.location || "--"}</span>
                          </span>
                        </div>

                        {/* Row 3: Client · Category · Status */}
                        <div className="flex items-center gap-5 flex-wrap">
                          <span className="flex items-center gap-1.5 shrink-0">
                            <FiUser className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400 text-xs shrink-0">Client:</span>
                            <span className="text-xs text-gray-700 font-medium">
                              {(() => {
                                try {
                                  if (!appt.patient) return "--";
                                  if (typeof appt.patient === "object" && "firstname" in appt.patient && "lastname" in appt.patient) {
                                    return `${(appt.patient as Patient).firstname} ${(appt.patient as Patient).lastname}`;
                                  }
                                  if (typeof appt.patient === "string" && patients.length > 0) {
                                    const p = patients.find((x: Patient) => x.id === appt.patient);
                                    return p && p.firstname && p.lastname ? `${p.firstname} ${p.lastname}` : "--";
                                  }
                                  return "--";
                                } catch (error) {
                                  console.error('Error in client name lookup:', error);
                                  return "--";
                                }
                              })()}
                            </span>
                          </span>
                          {appt.category_data && (
                            <span className="flex items-center gap-1.5 shrink-0">
                              <MdCategory className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="text-gray-400 text-xs shrink-0">Category:</span>
                              <span className="text-xs text-gray-700 font-medium">{appt.category_data.label}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 shrink-0">
                            <FiFlag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400 text-xs shrink-0">Status:</span>
                            <span className={`text-xs font-semibold ${appt.status === "done" ? "text-green-600" : appt.status === "alert" ? "text-red-500" : "text-amber-600"}`}>
                              {appt.status || "pending"}
                            </span>
                          </span>
                        </div>

                        {/* Row 4: Refer to (only if patient exists) */}
                        {appt.patient && (
                          <div className="flex items-center gap-1.5">
                            <FiUsers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400 text-xs shrink-0">Refer to:</span>
                            {(() => {
                              try {
                                if (process.env.NODE_ENV === "development") {
                                  console.log('DEBUG - Patient data:', { patient: appt.patient });
                                }
                                if (appt.patient && typeof appt.patient === 'object' && 'firstname' in appt.patient && 'lastname' in appt.patient) {
                                  const patientObj = appt.patient as Patient;
                                  return <span className="text-xs text-purple-700 font-medium">Patient: {patientObj.firstname} {patientObj.lastname}</span>;
                                }
                                if (typeof appt.patient === 'string' && patients.length > 0) {
                                  const patient = patients.find((p: Patient) => p.id === appt.patient);
                                  if (patient && patient.firstname && patient.lastname) {
                                    return <span className="text-xs text-purple-700 font-medium">Patient: {patient.firstname} {patient.lastname}</span>;
                                  }
                                }
                                return <span className="text-xs text-red-500">Patient data not available</span>;
                              } catch (error) {
                                console.error('Error in patient lookup:', error);
                                return <span className="text-xs text-red-500">Error loading patient</span>;
                              }
                            })()}
                          </div>
                        )}

                        {/* Row 5: Notes (only if present) */}
                        {appt.notes && (
                          <div className="flex items-center gap-1.5">
                            <FiFileText className={`w-3.5 h-3.5 shrink-0 ${isDone ? "text-gray-300" : "text-gray-400"}`} />
                            <span className="text-gray-400 text-xs shrink-0">Note:</span>
                            <span className={`text-xs ${isDone ? "line-through text-gray-400" : "text-gray-600"}`}>{appt.notes}</span>
                          </div>
                        )}

                        {/* Attachments (only if present) */}
                        {appt.attachements && appt.attachements.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <FiPaperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400 text-xs shrink-0">Attachments:</span>
                            {appt.attachements.map((file, idx) => {
                              const publicUrl = getPublicUrl(file);
                              const fileName = file.split("/").pop() || file;
                              return publicUrl ? (
                                <a key={idx} href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">{fileName}</a>
                              ) : (
                                <span key={idx} className="text-xs text-red-500">[File not found]</span>
                              );
                            })}
                          </div>
                        )}

                        {/* Assigned by */}
                        {dedupedAssignees.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <FiUsers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400 text-xs shrink-0">Assigned by:</span>
                            {appt.user_id === user?.id ? (
                              <span className="text-xs text-green-700 font-medium">you ({user?.email || "owner"})</span>
                            ) : (
                              <span className="text-xs text-blue-700 font-medium">
                                {(() => {
                                  const owner = ownerUsers.find(u => u.id === appt.user_id);
                                  return owner?.email || appt.user_id;
                                })()}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Activities */}
                        {appt.activities && appt.activities.length > 0 && (
                          <div className="flex flex-col gap-0.5">
                            {appt.activities.map((act, idx) => (
                              <span key={idx} className="text-xs text-pink-700">{act.type}: {act.content}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions column: 3-dot on top, Video Call on bottom */}
                      <div className="flex flex-col items-center justify-between py-3 px-2 border-l border-gray-100 bg-gray-50/80 rounded-r-2xl min-w-[56px]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/10">
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {(() => {
                              const perm = getUserPermission(appt);
                              return (
                                <>
                                  {(perm === "owner" || perm === "full" || perm === "write") && (
                                    <DropdownMenuItem onClick={() => handleToggleStatus(appt.id, isDone ? "pending" : "done")}>
                                      {isDone ? (
                                        <><Circle className="mr-2 h-4 w-4" /><span>Mark as open</span></>
                                      ) : (
                                        <><CheckCircle className="mr-2 h-4 w-4 text-green-600" /><span className="text-green-600">Mark as done</span></>
                                      )}
                                    </DropdownMenuItem>
                                  )}
                                  {(perm === "owner" || perm === "full") && (
                                    <>
                                      {(perm === "owner" || perm === "full" || perm === "write") && <DropdownMenuSeparator />}
                                      <DropdownMenuItem onClick={() => handleEdit(appt)}>
                                        <FiEdit2 className="mr-2 h-4 w-4" /><span>Edit</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDelete(appt.id)} className="text-red-600 focus:bg-red-50 focus:text-red-600">
                                        <FiTrash2 className="mr-2 h-4 w-4" /><span>Delete</span>
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </>
                              );
                            })()}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <VideoCall
                          appointmentId={appt.id}
                          appointmentTitle={appt.title ?? "Video Consultation"}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}
      {editAppt ? (
        <EditAppointmentDialog
          appointment={editAppt}
          onSuccess={handleEditSuccess}
          trigger={undefined}
          isOpen={editOpen}
          onOpenChange={handleEditDialogChange}
          refreshAppointments={refetchAppointments}
        />
      ) : null}
        </>
      )}
    </div>
  );
}