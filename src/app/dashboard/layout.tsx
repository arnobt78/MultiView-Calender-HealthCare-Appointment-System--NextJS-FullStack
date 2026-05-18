/**
 * Dashboard route group layout.
 *
 * All authenticated roles — including patients — can access /dashboard.
 * Patients see the calendar in read-only view (`CalendarHeader` uses
 * `NavRoleContext` / `initialNavRole` so Import / New Appointment stay hidden on refresh;
 * RBAC in the API layer rejects any write attempts).
 *
 * Patients are still sent to /patient-portal after login by default, but
 * they can navigate to /dashboard via the navbar link to view appointments.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
