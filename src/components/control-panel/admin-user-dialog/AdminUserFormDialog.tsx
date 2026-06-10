"use client";

import {
  ImageIcon,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorDialogFieldLabel } from "@/components/control-panel/doctor-dialog/DoctorDialogFieldLabel";
import type { AdminUserFormValues } from "@/lib/admin-user-form-state";
import {
  doctorDialogGlassBackButtonClass,
  doctorDialogGlassInputClass,
  doctorDialogGlassSelectTriggerClass,
  doctorDialogShellClass,
} from "@/lib/doctor-dialog-ui-classes";
import { emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
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
  /** Read-only verification badge — create preview uses false. */
  emailVerified?: boolean;
};

/** Admin account dialog — emerald glass shell parity with DoctorFormDialog; create stays demo-stubbed. */
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
  emailVerified = false,
}: AdminUserFormDialogProps) {
  const isCreate = mode === "create";
  const HeaderIcon = isCreate ? UserPlus : Pencil;
  const canSubmit = Boolean(form.display_name.trim()) && !isSubmitting && !devStub;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={doctorDialogShellClass}>
        <div className="shrink-0 bg-white pt-6 text-gray-700">
          <div className="px-6">
            <div className="flex items-start gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-50 text-emerald-700">
                <HeaderIcon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-left text-lg font-semibold text-gray-700">
                  {toTitleCaseLabel(isCreate ? "Add Admin Account" : "Update Admin Profile")}
                </DialogTitle>
                <DialogDescription className="text-left text-sm text-muted-foreground">
                  {devStub
                    ? devStub.note
                    : toTitleCaseLabel(
                        "Display name, contact, and active status. Role remains admin for B2B accounts."
                      )}
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-emerald-100 hover:text-emerald-800"
                >
                  <X className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-gray-700">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <DoctorDialogFieldLabel htmlFor="admin-user-email" icon={Mail}>
                Email
              </DoctorDialogFieldLabel>
              <Input
                id="admin-user-email"
                value={readOnlyEmail}
                readOnly
                className={cn(doctorDialogGlassInputClass, "opacity-80")}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <DoctorDialogFieldLabel htmlFor="admin-user-display-name" icon={UserRound} required>
                Display Name
              </DoctorDialogFieldLabel>
              <Input
                id="admin-user-display-name"
                value={form.display_name}
                onChange={(e) => onFormChange({ display_name: e.target.value })}
                className={doctorDialogGlassInputClass}
                placeholder="Full name"
              />
            </div>

            <div className="space-y-1.5">
              <DoctorDialogFieldLabel htmlFor="admin-user-role" icon={ShieldCheck}>
                Role
              </DoctorDialogFieldLabel>
              <Select value="admin" disabled>
                <SelectTrigger id="admin-user-role" className={doctorDialogGlassSelectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <DoctorDialogFieldLabel htmlFor="admin-user-phone" icon={Phone}>
                Phone
              </DoctorDialogFieldLabel>
              <Input
                id="admin-user-phone"
                value={form.phone}
                onChange={(e) => onFormChange({ phone: e.target.value })}
                className={doctorDialogGlassInputClass}
                placeholder="+1 555 0100"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <DoctorDialogFieldLabel htmlFor="admin-user-image" icon={ImageIcon}>
                Image URL
              </DoctorDialogFieldLabel>
              <Input
                id="admin-user-image"
                value={form.image}
                onChange={(e) => onFormChange({ image: e.target.value })}
                className={doctorDialogGlassInputClass}
                placeholder="/users/img-1.avif or https://…"
              />
            </div>

            <div className="space-y-1.5">
              <DoctorDialogFieldLabel htmlFor="admin-user-status" icon={ShieldCheck}>
                Account Status
              </DoctorDialogFieldLabel>
              <Select
                value={form.is_active ? "active" : "inactive"}
                onValueChange={(v) => onFormChange({ is_active: v === "active" })}
                disabled={Boolean(devStub)}
              >
                <SelectTrigger id="admin-user-status" className={doctorDialogGlassSelectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <DoctorDialogFieldLabel icon={ShieldCheck}>Email Verified</DoctorDialogFieldLabel>
              <div className="flex min-h-10 items-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    emailVerified
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  )}
                >
                  {emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 space-y-3 border-t border-emerald-200/60 bg-emerald-50/40 px-6 py-4">
          {devStub ? <CpDevStubSubmitNote stub={devStub} /> : null}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className={cn(doctorDialogGlassBackButtonClass, "cursor-pointer rounded-full")}
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
              className={cn(emeraldGlassPrimaryButtonClass, "cursor-pointer rounded-full")}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {toTitleCaseLabel(isCreate ? "Creating…" : "Saving…")}
                </>
              ) : (
                <>
                  {isCreate ? (
                    <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
                  ) : (
                    <Save className="h-4 w-4 shrink-0" aria-hidden />
                  )}
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
