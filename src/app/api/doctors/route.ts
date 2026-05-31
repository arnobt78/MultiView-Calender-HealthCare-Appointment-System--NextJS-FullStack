/**
 * GET /api/doctors
 *
 * Returns all users with role = "doctor", including:
 *   - specialty, bio, image
 *   - Mon–Sun availability windows (from DoctorAvailability)
 *   - Count of assigned patients (where primary_doctor_id = user.id)
 *
 * Used by the /services page and DoctorManagement.
 * Accessible to all authenticated roles.
 */

import { NextResponse } from "next/server";
import { mergeBookableTypesForDoctor } from "@/lib/doctor-bookable-types";
import {
  fetchPaidRevenueCentsByDoctorIds,
  resolveDoctorPaidRevenueCents,
} from "@/lib/doctor-revenue-aggregate";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [doctors, globalTypes] = await Promise.all([
      prisma.user.findMany({
      where: { role: "doctor" },
        select: {
        id: true,
        email: true,
        display_name: true,
        image: true,
        specialty: true,
        bio: true,
        created_at: true,
        is_active: true,
        active_since: true,
        // Extended professional fields added in migration 006
        phone: true,
        license_number: true,
        consultation_fee: true,
        languages_spoken: true,
        years_of_experience: true,
        office_location: true,
        department: true,
        doctor_availabilities: {
          select: { weekday: true, start_min: true, end_min: true, timezone: true },
          orderBy: { weekday: "asc" },
        },
        appointment_types_owned: {
          where: { user_id: { not: null }, is_active: true },
          select: {
            id: true,
            name: true,
            duration_minutes: true,
            description: true,
            is_telehealth: true,
            buffer_before_minutes: true,
            buffer_after_minutes: true,
            slot_interval_minutes: true,
          },
        },
        // Count enabled global types from the junction table
        doctor_type_configs: {
          where: { is_enabled: true },
          select: { id: true },
        },
        // Count patients assigned to this doctor
        patients_primary_doctor: {
          select: { id: true },
        },
      },
      orderBy: { display_name: "asc" },
      }),
      prisma.appointmentType.findMany({
        where: { user_id: null, is_active: true },
        select: {
          id: true,
          name: true,
          duration_minutes: true,
          description: true,
          is_telehealth: true,
          buffer_before_minutes: true,
          buffer_after_minutes: true,
          slot_interval_minutes: true,
          doctor_configs: {
            select: { doctor_id: true, is_enabled: true },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const revenueByDoctor = await fetchPaidRevenueCentsByDoctorIds(doctors.map((d) => d.id));

    const serialized = doctors.map((d) => {
      const owned = d.appointment_types_owned;
      const bookable_appointment_types = mergeBookableTypesForDoctor(d.id, owned, globalTypes);
      return {
      id: d.id,
      email: d.email,
      display_name: d.display_name,
      image: d.image,
      specialty: d.specialty,
      bio: d.bio,
      created_at: d.created_at.toISOString(),
      is_active: d.is_active,
      active_since: d.active_since?.toISOString() ?? null,
      phone: d.phone,
      license_number: d.license_number,
      consultation_fee: d.consultation_fee,
      languages_spoken: d.languages_spoken,
      years_of_experience: d.years_of_experience,
      office_location: d.office_location,
      department: d.department,
      availabilities: d.doctor_availabilities,
      appointment_types: owned,
      bookable_appointment_types,
      enabled_type_count: d.doctor_type_configs.length,
      patient_count: d.patients_primary_doctor.length,
      paid_revenue_cents: resolveDoctorPaidRevenueCents(d.id, revenueByDoctor),
      };
    });

    return NextResponse.json({ doctors: serialized });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
