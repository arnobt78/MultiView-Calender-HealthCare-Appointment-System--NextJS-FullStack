import { describe, expect, it } from "vitest";
import type { AppointmentCrossTabMergePayload } from "@/lib/appointment-detail-api";
import {
  publishAppointmentMergeCrossTab,
  publishAppointmentRemoveCrossTab,
} from "@/lib/query-cache-cross-tab";

describe("publishAppointmentMergeCrossTab", () => {
  const payload: AppointmentCrossTabMergePayload = {
    appointment: {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: null,
      title: "Visit",
      start: "2026-06-04T10:00:00.000Z",
      end: "2026-06-04T10:30:00.000Z",
      status: "pending",
      user_id: "owner-1",
      patient: "pat-1",
      category: null,
      location: null,
      notes: null,
      attachments: [],
      is_telehealth: false,
    },
  };

  it("publishes merge payload without throwing in browser context", () => {
    expect(() =>
      publishAppointmentMergeCrossTab(payload, { scope: "schedule", patientId: "pat-1" })
    ).not.toThrow();
  });

  it("publishes remove payload without throwing", () => {
    expect(() =>
      publishAppointmentRemoveCrossTab(payload.appointment.id, { scope: "billing" })
    ).not.toThrow();
  });
});
