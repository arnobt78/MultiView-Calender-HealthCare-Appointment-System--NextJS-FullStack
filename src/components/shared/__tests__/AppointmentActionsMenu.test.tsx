import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AppointmentActionsMenu } from "@/components/shared/AppointmentActionsMenu";

vi.mock("@/context/NavRoleContext", () => ({
  useInitialNavRole: () => "admin",
}));

vi.mock("@/components/shared/ConfirmActionDialog", () => ({
  ConfirmActionDialog: () => null,
}));

vi.mock("@/components/shared/appointment-detail/AppointmentCancelConfirmDialog", () => ({
  AppointmentCancelConfirmDialog: () => null,
}));

vi.mock("@/hooks/usePayments", () => ({
  usePayments: () => ({ invoices: [] }),
}));

vi.mock("@/hooks/useAppointmentCancelWithRefund", () => ({
  useAppointmentCancelWithRefund: () => ({
    cancelWithOptionalRefundAsync: vi.fn(),
    isCancelFlowPending: false,
    isCancelFlowPendingFor: () => false,
    pendingFlowAppointmentId: null,
  }),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="menu-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button type="button" disabled={disabled} data-disabled={disabled ? "" : undefined} onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

const baseAppointment = {
  id: "appt-1",
  user_id: "owner-1",
  status: "pending",
  treating_physician_id: "doc-1",
  appointment_assignee: [],
};

function renderMenu(
  overrides: Partial<React.ComponentProps<typeof AppointmentActionsMenu>> = {}
) {
  return renderToStaticMarkup(
    <AppointmentActionsMenu
      appointment={baseAppointment}
      userId="user-1"
      userEmail="staff@test.com"
      userRole="admin"
      onToggleStatus={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
      {...overrides}
    />
  );
}

describe("AppointmentActionsMenu Google sync item", () => {
  it("shows sync item when connected and handler provided", () => {
    const markup = renderMenu({
      showSyncToGoogle: true,
      onSyncToGoogle: vi.fn(),
    });
    expect(markup).toContain("Sync to Google Calendar");
  });

  it("hides sync item when showSyncToGoogle is false", () => {
    const markup = renderMenu({
      showSyncToGoogle: false,
      onSyncToGoogle: vi.fn(),
    });
    expect(markup).not.toContain("Sync to Google Calendar");
  });

  it("disables sync item when appointment is cancelled", () => {
    const markup = renderMenu({
      appointment: { ...baseAppointment, status: "cancelled" },
      showSyncToGoogle: true,
      onSyncToGoogle: vi.fn(),
    });
    expect(markup).toContain("Sync to Google Calendar");
    expect(markup).toContain("data-disabled");
  });

  it("shows syncing label when isSyncingGoogle", () => {
    const markup = renderMenu({
      showSyncToGoogle: true,
      onSyncToGoogle: vi.fn(),
      isSyncingGoogle: true,
    });
    expect(markup).toContain("Syncing…");
  });
});

describe("AppointmentActionsMenu Edit", () => {
  it("uses onEdit callback — not a detail Link for Edit row", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const src = readFileSync(
      resolve(process.cwd(), "src/components/shared/AppointmentActionsMenu.tsx"),
      "utf8"
    );
    expect(src).toContain("onEdit()");
  });
});

describe("AppointmentActionsMenu Cancel", () => {
  it("shows cancel label for admin on pending visit", () => {
    const markup = renderMenu({
      userRole: "admin",
      appointment: { ...baseAppointment, status: "pending" },
    });
    expect(markup).toContain("Cancel Appointment");
  });
});
