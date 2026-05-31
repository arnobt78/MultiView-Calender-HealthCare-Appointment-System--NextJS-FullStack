"use client";

import { Loader2, Mail, Pencil, Save, UserRound, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminUserFormValues } from "@/lib/admin-user-form-state";
import { adminUserDialogShellClass } from "@/lib/admin-user-detail-ui-classes";
import { CpDevStubSubmitNote } from "@/components/shared/control-panel/CpDevStubSubmitNote";
import type { CpDevStubCopy } from "@/lib/cp-dev-stub-copy";
import { cn } from "@/lib/utils";

type AdminUserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnlyEmail: string;
  form: AdminUserFormValues;
  onFormChange: (patch: Partial<AdminUserFormValues>) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  devStub?: CpDevStubCopy;
};

/** Edit admin account — slate glass shell; role locked to admin. */
export function AdminUserFormDialog({
  open,
  onOpenChange,
  readOnlyEmail,
  form,
  onFormChange,
  onSubmit,
  isSubmitting = false,
  mode = "edit",
  devStub,
}: AdminUserFormDialogProps) {
  const isCreate = mode === "create";
  const canSubmit = !isSubmitting && !devStub;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={adminUserDialogShellClass}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 px-6 py-4">
          <div className="min-w-0 space-y-1">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Pencil className="h-4 w-4 text-slate-600" aria-hidden />
              {isCreate ? "Add Admin Account" : "Update Admin Profile"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {devStub
                ? devStub.note
                : "Display name and avatar URL. Role remains admin."}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon" className="shrink-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600" htmlFor="admin-user-email">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="admin-user-email" value={readOnlyEmail} readOnly className="pl-9 bg-slate-50/80" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600" htmlFor="admin-user-display-name">
              Display Name
            </label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-user-display-name"
                value={form.display_name}
                onChange={(e) => onFormChange({ display_name: e.target.value })}
                className="pl-9"
                placeholder="Full name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600" htmlFor="admin-user-image">
              Image URL
            </label>
            <Input
              id="admin-user-image"
              value={form.image}
              onChange={(e) => onFormChange({ image: e.target.value })}
              placeholder="/users/img-1.avif or https://…"
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200/70 bg-slate-50/40 px-6 py-3">
          {devStub ? <CpDevStubSubmitNote stub={devStub} /> : null}
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className={cn("gap-2 bg-slate-700 hover:bg-slate-800 text-white disabled:opacity-50")}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden />
                  {isCreate ? "Create Admin" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
