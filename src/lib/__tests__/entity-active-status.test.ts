import { describe, expect, it } from "vitest";
import {
  isCategoryActive,
  isPatientActive,
  partitionForBookingSelect,
  sortCategoriesForBookingSelect,
} from "@/lib/entity-active-status";
import type { Category, Patient } from "@/types/types";

const patient = (id: string, active: boolean): Patient =>
  ({
    id,
    firstname: "A",
    lastname: id,
    active,
    created_at: "",
    updated_at: "",
  }) as Patient;

const category = (id: string, is_active: boolean, sort_order = 0): Category =>
  ({
    id,
    label: id,
    is_active,
    sort_order,
    created_at: "",
    updated_at: "",
  }) as Category;

describe("entity-active-status", () => {
  it("isPatientActive treats missing active as true", () => {
    expect(isPatientActive({ active: true } as Patient)).toBe(true);
    expect(isPatientActive({ active: false } as Patient)).toBe(false);
  });

  it("isCategoryActive treats missing is_active as true", () => {
    expect(isCategoryActive({ is_active: true } as Category)).toBe(true);
    expect(isCategoryActive({ is_active: false } as Category)).toBe(false);
  });

  it("partitionForBookingSelect splits active and inactive", () => {
    const items = [patient("1", true), patient("2", false), patient("3", true)];
    const { selectable, inactiveDisplay } = partitionForBookingSelect({
      items,
      isActive: isPatientActive,
      getId: (p) => p.id,
    });
    expect(selectable.map((p) => p.id)).toEqual(["1", "3"]);
    expect(inactiveDisplay.map((p) => p.id)).toEqual(["2"]);
  });

  it("partitionForBookingSelect keeps current inactive id selectable when editing", () => {
    const items = [category("a", true), category("b", false)];
    const { selectable, inactiveDisplay } = partitionForBookingSelect({
      items,
      isActive: isCategoryActive,
      getId: (c) => c.id,
      currentId: "b",
    });
    expect(selectable.map((c) => c.id)).toEqual(["a", "b"]);
    expect(inactiveDisplay).toHaveLength(0);
  });

  it("partitionForBookingSelect excludes client when used for assignee picker", () => {
    const items = [patient("client", true), patient("other", true), patient("inactive", false)];
    const forPicker = items.filter((p) => p.id !== "client");
    const { selectable, inactiveDisplay } = partitionForBookingSelect({
      items: forPicker,
      isActive: isPatientActive,
      getId: (p) => p.id,
    });
    expect(selectable.map((p) => p.id)).toEqual(["other"]);
    expect(inactiveDisplay.map((p) => p.id)).toEqual(["inactive"]);
    expect(selectable.some((p) => p.id === "client")).toBe(false);
  });

  it("sortCategoriesForBookingSelect orders by sort_order then label", () => {
    const a = category("b", true, 2);
    const b = category("a", true, 1);
    expect(sortCategoriesForBookingSelect(a, b)).toBeGreaterThan(0);
  });
});
