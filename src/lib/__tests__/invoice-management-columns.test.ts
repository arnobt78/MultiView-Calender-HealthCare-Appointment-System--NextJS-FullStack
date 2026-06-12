import { describe, expect, it } from "vitest";
import type { ColumnDef } from "@tanstack/react-table";
import { buildInvoiceManagementColumns } from "@/components/control-panel/invoice-management-columns";
import type { Invoice } from "@/hooks/usePayments";
import { getInvoiceListSortKey } from "@/lib/invoice-list-display";

const noop = () => {};

function runAccessor(col: ColumnDef<Invoice>, row: Invoice): unknown {
  if (!("accessorFn" in col) || !col.accessorFn) return undefined;
  return col.accessorFn(row, 0);
}

const sampleInvoice: Invoice = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  amount: 15000,
  currency: "eur",
  status: "draft",
  created_at: "2026-01-15T10:00:00.000Z",
  payments: [],
  description: "Consultation",
  due_date: "2026-02-01",
};

describe("buildInvoiceManagementColumns", () => {
  const columns = buildInvoiceManagementColumns({
    viewerRole: "admin",
    onEdit: noop,
    onPay: noop,
    onSend: noop,
    onMarkPaid: noop,
    onCancel: noop,
    onDelete: noop,
    onRefund: noop,
  });

  it("defines expected column ids in order", () => {
    expect(columns.map((c) => c.id)).toEqual([
      "invoice_number",
      "description",
      "amount_status",
      "due",
      "created",
      "actions",
    ]);
  });

  it("amount_status column sorts on amount accessor", () => {
    const col = columns.find((c) => c.id === "amount_status")!;
    expect("accessorKey" in col && col.accessorKey).toBe("amount");
  });

  it("description column uses getInvoiceListSortKey", () => {
    const descCol = columns.find((c) => c.id === "description")!;
    expect(runAccessor(descCol, sampleInvoice)).toBe(
      getInvoiceListSortKey(sampleInvoice)
    );
    const withPatient: Invoice = {
      ...sampleInvoice,
      description: undefined,
      visit_summary: {
        appointment_id: "appt-1",
        title: "Follow-up",
        location_label: "",
        is_telehealth: false,
        patient_id: "p1",
        patient_label: "Jane Doe",
        patient_email: null,
        patient_birth_date: null,
        patient_care_level: null,
        when_label: "Jan 15",
        start_iso: "2026-01-15T10:00:00.000Z",
        end_iso: "2026-01-15T11:00:00.000Z",
        category_id: null,
        category_label: null,
        category_color: null,
        category_icon: null,
        treating_physician_id: null,
        treating_physician_label: null,
        treating_physician_specialty: null,
        calendar_owner_id: null,
        calendar_owner_label: null,
        calendar_owner_specialty: null,
        appointment_type_name: "Consultation",
      },
    };
    expect(runAccessor(descCol, withPatient)).toBe(
      getInvoiceListSortKey(withPatient)
    );
  });

  it("actions column disables sorting", () => {
    const actions = columns.find((c) => c.id === "actions");
    expect(actions?.enableSorting).toBe(false);
  });

  it("due column uses due_date accessor", () => {
    const due = columns.find((c) => c.id === "due")!;
    expect(runAccessor(due, sampleInvoice)).toBe("2026-02-01");
  });
});
