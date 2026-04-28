/**
 * Shared queryFns for TanStack Query — used by resource hooks and ensureQueryData in useAppointments.
 */
import { apiClient } from "@/lib/api-client";
import type {
  Activity,
  AppointmentAssignee,
  Category,
  Patient,
  Relative,
} from "@/types/types";

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiClient<{ categories: Category[] }>("/api/categories");
  return res.categories || [];
}

export async function fetchPatients(): Promise<Patient[]> {
  const res = await apiClient<{ patients: Patient[] }>("/api/patients");
  return res.patients || [];
}

export async function fetchRelatives(): Promise<Relative[]> {
  const res = await apiClient<{ relatives: Relative[] }>("/api/relatives");
  return res.relatives || [];
}

export async function fetchAssignees(): Promise<AppointmentAssignee[]> {
  const res = await apiClient<{ assignees: AppointmentAssignee[] }>("/api/appointment-assignees");
  return res.assignees || [];
}

export async function fetchActivitiesList(): Promise<Activity[]> {
  const res = await apiClient<{ activities: Activity[] }>("/api/activities");
  return res.activities || [];
}

export type DashboardAccessRow = {
  id: string;
  owner_user_id: string;
  invited_user_id: string | null;
  invited_email: string | null;
  status: string | null;
  [key: string]: unknown;
};

export async function fetchDashboardAccessAccepted(): Promise<DashboardAccessRow[]> {
  const res = await apiClient<{ dashboard_access: DashboardAccessRow[] }>(
    "/api/dashboard-access?status=accepted"
  );
  return res.dashboard_access || [];
}

export async function fetchDashboardAccessAll(): Promise<DashboardAccessRow[]> {
  const res = await apiClient<{ dashboard_access: DashboardAccessRow[] }>("/api/dashboard-access");
  return res.dashboard_access || [];
}
