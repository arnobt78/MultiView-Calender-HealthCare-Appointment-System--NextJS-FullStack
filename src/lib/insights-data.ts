import { prisma } from "@/lib/prisma";

export interface InsightsPayload {
  overview: { total: number; done: number; pending: number; upcoming: number; overdue: number; thisMonth: number };
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  monthlyData: { month: string; count: number }[];
  topPatients: { name: string; count: number }[];
}

export async function getInsightsData(userId: string): Promise<InsightsPayload> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const appointments = await prisma.appointment.findMany({
    where: { user_id: userId },
    include: { category: true, patient: true },
    orderBy: { start: "desc" },
  });

  const total = appointments.length;
  const done = appointments.filter((a) => a.status === "done").length;
  const pending = appointments.filter((a) => a.status === "pending" || !a.status).length;
  const upcoming = appointments.filter((a) => new Date(a.start) > now).length;
  const overdue = appointments.filter((a) => new Date(a.end) < now && a.status !== "done").length;
  const thisMonth = appointments.filter((a) => new Date(a.start) >= startOfMonth).length;

  const byStatus: Record<string, number> = {};
  for (const a of appointments) {
    const s = a.status || "pending";
    byStatus[s] = (byStatus[s] || 0) + 1;
  }

  const byCategory: Record<string, number> = {};
  for (const a of appointments) {
    const cat = a.category?.label || "Uncategorized";
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }

  const monthlyData: { month: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const count = appointments.filter((a) => {
      const start = new Date(a.start);
      return start >= d && start <= monthEnd;
    }).length;
    monthlyData.push({
      month: d.toLocaleDateString("en", { month: "short", year: "2-digit" }),
      count,
    });
  }

  const patientVisits: Record<string, { name: string; count: number }> = {};
  for (const a of appointments) {
    if (a.patient) {
      const key = a.patient.id;
      if (!patientVisits[key]) {
        patientVisits[key] = { name: `${a.patient.firstname} ${a.patient.lastname}`, count: 0 };
      }
      patientVisits[key].count++;
    }
  }
  const topPatients = Object.values(patientVisits)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    overview: { total, done, pending, upcoming, overdue, thisMonth },
    byStatus,
    byCategory,
    monthlyData,
    topPatients,
  };
}
