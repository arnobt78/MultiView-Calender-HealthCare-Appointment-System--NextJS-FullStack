import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: { count: vi.fn(), findMany: vi.fn() },
    patient: { count: vi.fn() },
    user: { count: vi.fn(), findMany: vi.fn() },
    invoice: { aggregate: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  ADMIN_PORTAL_APPOINTMENT_LIST_LIMIT,
  fetchAdminPortalData,
} from "@/lib/admin-portal-load";

const APPT_ID = "c40e5d58-6701-4ded-b085-d3cdaf62f9e3";
const PATIENT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const OWNER_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const TREATING_ID = "8d9e6679-7425-40de-944b-e07fc1f90ae8";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.appointment.count).mockResolvedValue(10);
  vi.mocked(prisma.patient.count).mockResolvedValue(5);
  vi.mocked(prisma.user.count).mockResolvedValue(2);
  vi.mocked(prisma.user.findMany).mockResolvedValue([]);
  vi.mocked(prisma.invoice.aggregate).mockResolvedValue({ _sum: { amount: 10000 } } as never);
});

describe("fetchAdminPortalData", () => {
  it("requests up to ADMIN_PORTAL_APPOINTMENT_LIST_LIMIT appointments sorted by start desc", async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);

    await fetchAdminPortalData();

    expect(prisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { start: "desc" },
        take: ADMIN_PORTAL_APPOINTMENT_LIST_LIMIT,
        include: expect.objectContaining({
          patient: expect.any(Object),
          owner: expect.any(Object),
          treating_physician: expect.any(Object),
          category: expect.any(Object),
          appointment_type: expect.any(Object),
        }),
      })
    );
  });

  it("maps enriched appointment fields and aliases recentAppointments", async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([
      {
        id: APPT_ID,
        title: "Follow-up",
        start: new Date("2026-06-10T10:00:00Z"),
        end: new Date("2026-06-10T11:00:00Z"),
        status: "scheduled",
        user_id: OWNER_ID,
        treating_physician_id: TREATING_ID,
        patient_id: PATIENT_ID,
        category_id: "cat-1",
        location: "Room 2",
        created_at: new Date("2026-06-01"),
        updated_at: null,
        notes: null,
        attachments: [],
        is_telehealth: false,
        patient: {
          id: PATIENT_ID,
          firstname: "Jane",
          lastname: "Doe",
          email: "jane@example.com",
          clinical_profile: { image_url: "https://img.test/jane.png" },
        },
        owner: {
          id: OWNER_ID,
          display_name: "Dr Owner",
          email: "owner@clinic.com",
          image: null,
          specialty: "GP",
          role: "doctor",
          consultation_fee: 5000,
        },
        treating_physician: {
          id: TREATING_ID,
          display_name: "Dr Treating",
          email: "treat@clinic.com",
          image: null,
          specialty: "Cardio",
          role: "doctor",
          consultation_fee: 8000,
        },
        category: { id: "cat-1", label: "Cardiology", color: "#f00", icon: "heart" },
        appointment_type: {
          id: "type-1",
          name: "Consultation",
          duration_minutes: 60,
          is_telehealth: false,
          price_cents: 12000,
          color: null,
        },
      },
    ] as never);

    const data = await fetchAdminPortalData();

    expect(data.appointments).toHaveLength(1);
    expect(data.recentAppointments).toEqual(data.appointments);
    expect(data.appointmentTotal).toBe(1);

    const row = data.appointments![0]!;
    expect(row.patient_name).toBe("Jane Doe");
    expect(row.patient_email).toBe("jane@example.com");
    expect(row.patient_image).toBe("https://img.test/jane.png");
    expect(row.category_data?.label).toBe("Cardiology");
    expect(row.owner_clinician?.display_name).toBe("Dr Owner");
    expect(row.treating_clinician?.display_name).toBe("Dr Treating");
    expect(row.owner_display).toBe("Dr Owner");
    expect(row.doctor_consultation_fee_cents).toBe(8000);
  });

  it("returns overview KPIs from aggregate counts", async () => {
    vi.mocked(prisma.appointment.count)
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(3);
    vi.mocked(prisma.patient.count).mockResolvedValue(50);
    vi.mocked(prisma.user.count).mockResolvedValue(8);
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);
    vi.mocked(prisma.invoice.aggregate)
      .mockResolvedValueOnce({ _sum: { amount: 250000 } } as never)
      .mockResolvedValueOnce({ _sum: { amount: 45000 } } as never);

    const data = await fetchAdminPortalData();

    expect(data.overview).toEqual({
      totalAppointments: 100,
      todayAppointments: 4,
      totalPatients: 50,
      totalDoctors: 8,
      pendingAppointments: 12,
      overdueAppointments: 3,
      paidRevenueCents: 250000,
      outstandingRevenueCents: 45000,
    });
  });
});
