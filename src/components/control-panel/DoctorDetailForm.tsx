"use client";

import { useState } from "react";
import { useUser, UserUpdateInput } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { User } from "@/types/types";

const ROLES = ["admin", "doctor", "secretary", "patient"] as const;

interface DoctorDetailFormProps {
  initialUser: User;
}

export function DoctorDetailForm({ initialUser }: DoctorDetailFormProps) {
  const { updateUser, isUpdating } = useUser(initialUser.id);
  const [form, setForm] = useState<UserUpdateInput>({
    display_name: initialUser.display_name ?? "",
    role: initialUser.role ?? "",
    image: initialUser.image ?? "",
  });

  const handleSave = () => {
    updateUser({
      id: initialUser.id,
      ...form,
    } as UserUpdateInput & { id: string });
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="font-semibold text-sm">Edit User</h3>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={form.display_name ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
            placeholder="Full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={form.role ?? ""}
            onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            value={form.image ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="flex-1 sm:flex-none"
        >
          {isUpdating ? "Saving…" : "Save changes"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" type="button" className="text-destructive hover:text-destructive">
              Reset form
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset form?</AlertDialogTitle>
              <AlertDialogDescription>This will discard unsaved changes.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  setForm({
                    display_name: initialUser.display_name ?? "",
                    role: initialUser.role ?? "",
                    image: initialUser.image ?? "",
                  })
                }
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
