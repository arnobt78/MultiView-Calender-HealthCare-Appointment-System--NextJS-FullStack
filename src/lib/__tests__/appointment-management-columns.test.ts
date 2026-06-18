import { describe, expect, it } from "vitest";
import type { ColumnDef } from "@tanstack/react-table";
import { buildAppointmentManagementColumns } from "@/components/control-panel/appointment-management-columns";
import type { FullAppointment } from "@/hooks/useAppointments";

const noop = () => {};

describe("buildAppointmentManagementColumns", () => {
  const columns = buildAppointmentManagementColumns({
    viewerRole: "admin",
    doctorById: new Map(),
    invoiceDisplayByAppt: new Map(),
    invoiceByAppt: new Map(),
    onEdit: noop,
    onToggleStatus: noop,
    onDelete: noop,
  });

  it("defines expected column ids in order", () => {
    expect(columns.map((c) => c.id)).toEqual([
      "title",
      "status",
      "when",
      "category",
      "patient",
      "treating",
      "actions",
    ]);
  });

  it("when column sorts on start accessor", () => {
    const col = columns.find((c) => c.id === "when") as ColumnDef<FullAppointment>;
    expect("accessorFn" in col && typeof col.accessorFn).toBe("function");
  });

  it("actions column disables sorting", () => {
    expect(columns.find((c) => c.id === "actions")?.enableSorting).toBe(false);
  });
});
