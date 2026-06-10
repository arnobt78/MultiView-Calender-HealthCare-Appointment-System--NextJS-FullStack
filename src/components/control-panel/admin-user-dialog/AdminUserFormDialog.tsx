"use client";

import { ImageIcon, Loader2, Mail, Pencil, Save, UserPlus, UserRound, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminUserDialogFieldLabel } from "@/components/control-panel/admin-user-dialog/AdminUserDialogFieldLabel";
import type { AdminUserFormValues } from "@/lib/admin-user-form-state";
import {
  adminUserDialogGlassBackButtonClass,
  adminUserDialogGlassInputClass,
  adminUserDialogShellClass,
} from "@/lib/admin-user-detail-ui-classes";
import { CpDevStubSubmitNote } from "@/components/shared/control-panel/CpDevStubSubmitNote";
import type { CpDevStubCopy } from "@/lib/cp-dev-stub-copy";
import { cn, toTitleCaseLabel } from "@/lib/utils";

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

/** Edit admin account — slate glass shell aligned with patient form dialog chrome. */
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
  const HeaderIcon = isCreate ? UserPlus : Pencil;
  const SubmitIcon = isCreate ? UserPlus : Save;
  const canSubmit = Boolean(form.display_name.trim()) && !isSubmitting && !devStub;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={adminUserDialogShellClass}>
        <div className="shrink-0 bg-white pt-6 text-gray-700">
          <div className="px-6">
            <div className="flex items-start gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50 text-slate-700">
                <HeaderIcon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-left text-lg font-semibold text-gray-700">
                  {isCreate
                    ? toTitleCaseLabel("Add Admin Account")
                    : toTitleCaseLabel("Update Admin Profile")}
                </DialogTitle>
                <DialogDescription className="text-left text-sm text-muted-foreground">
                  {devStub
                    ? devStub.note
                    : toTitleCaseLabel(
                        "Display name and avatar URL. Role remains admin for B2B accounts."
                      )}
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-slate-100 hover:text-slate-800"
                >
                  <X className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="mx-6 mt-4 border-b border-slate-200/60" />
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4 text-gray-700">
          <div className="space-y-2">
            <AdminUserDialogFieldLabel htmlFor="admin-user-email" icon={Mail}>
              Email
            </AdminUserDialogFieldLabel>
            <Input
              id="admin-user-email"
              value={readOnlyEmail}
              readOnly
              className={cn(adminUserDialogGlassInputClass, "opacity-80")}
            />
          </div>

          <div className="space-y-2">
            <AdminUserDialogFieldLabel htmlFor="admin-user-display-name" icon={UserRound} required>
              Display Name
            </AdminUserDialogFieldLabel>
            <Input
              id="admin-user-display-name"
              value={form.display_name}
              onChange={(e) => onFormChange({ display_name: e.target.value })}
              className={adminUserDialogGlassInputClass}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-2">
            <AdminUserDialogFieldLabel htmlFor="admin-user-image" icon={ImageIcon}>
              Image URL
            </AdminUserDialogFieldLabel>
            <Input
              id="admin-user-image"
              value={form.image}
              onChange={(e) => onFormChange({ image: e.target.value })}
              className={adminUserDialogGlassInputClass}
              placeholder="/users/img-1.avif or https://…"
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200/70 bg-slate-50/40 px-6 py-3">
          {devStub ? <CpDevStubSubmitNote stub={devStub} /> : null}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className={cn(adminUserDialogGlassBackButtonClass, "cursor-pointer rounded-full")}
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="size-4 shrink-0" aria-hidden />
              {toTitleCaseLabel("Cancel")}
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className={cn(
                "gap-2 rounded-full bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {toTitleCaseLabel(isCreate ? "Creating…" : "Saving…")}
                </>
              ) : (
                <>
                  <SubmitIcon className="h-4 w-4 shrink-0" aria-hidden />
                  {toTitleCaseLabel(isCreate ? "Create Admin" : "Save Changes")}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
