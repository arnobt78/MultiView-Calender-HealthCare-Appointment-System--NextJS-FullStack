import { describe, expect, it } from "vitest";
import {
  filterBookableTypesForDoctorFromApi,
  mergeBookableTypesForDoctor,
} from "@/lib/doctor-bookable-types";

describe("mergeBookableTypesForDoctor", () => {
  const globals = [
    {
      id: "g1",
      name: "Follow-up Visit",
      duration_minutes: 30,
      buffer_before_minutes: 5,
      buffer_after_minutes: 5,
      slot_interval_minutes: 30,
      doctor_configs: [{ doctor_id: "doc-a", is_enabled: true }],
    },
    {
      id: "g2",
      name: "Telehealth Session",
      duration_minutes: 20,
      buffer_before_minutes: 5,
      buffer_after_minutes: 5,
      slot_interval_minutes: 30,
      doctor_configs: [{ doctor_id: "doc-a", is_enabled: false }],
    },
  ];

  it("includes owned types and enabled globals with scheduling fields", () => {
    const merged = mergeBookableTypesForDoctor(
      "doc-a",
      [
        {
          id: "o1",
          name: "Physio Therapy",
          duration_minutes: 30,
          buffer_before_minutes: 5,
          buffer_after_minutes: 5,
          slot_interval_minutes: 30,
        },
      ],
      globals
    );
    expect(merged.map((t) => t.id)).toEqual(["o1", "g1"]);
    expect(merged[0]?.is_global).toBe(false);
    expect(merged[0]?.buffer_before_minutes).toBe(5);
    expect(merged[1]?.is_global).toBe(true);
    expect(merged[1]?.slot_interval_minutes).toBe(30);
  });

  it("filterBookableTypesForDoctorFromApi drops disabled globals and keeps owned", () => {
    const filtered = filterBookableTypesForDoctorFromApi("doc-a", [
      {
        id: "o1",
        user_id: "doc-a",
        name: "Physio",
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
        is_enabled: true,
      },
      {
        id: "g1",
        user_id: null,
        name: "Follow-up",
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
        is_enabled: true,
      },
      {
        id: "g2",
        user_id: null,
        name: "Telehealth",
        duration_minutes: 20,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
        is_enabled: false,
      },
    ]);
    expect(filtered.map((t) => t.id)).toEqual(["o1", "g1"]);
  });

  it("filterBookableTypesForDoctorFromApi drops inactive owned types", () => {
    const filtered = filterBookableTypesForDoctorFromApi("doc-a", [
      {
        id: "o1",
        user_id: "doc-a",
        name: "Physio",
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
        is_enabled: true,
        is_active: true,
      },
      {
        id: "o2",
        user_id: "doc-a",
        name: "Hidden",
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
        is_enabled: false,
        is_active: false,
      },
      {
        id: "g1",
        user_id: null,
        name: "Follow-up",
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
        is_enabled: true,
      },
    ]);
    expect(filtered.map((t) => t.id)).toEqual(["o1", "g1"]);
  });

  it("enables global when no config row exists", () => {
    const merged = mergeBookableTypesForDoctor("doc-b", [], [
      {
        id: "g3",
        name: "Annual Check-up",
        duration_minutes: 45,
        buffer_before_minutes: 10,
        buffer_after_minutes: 10,
        slot_interval_minutes: 45,
        doctor_configs: [],
      },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.is_global).toBe(true);
  });
});
