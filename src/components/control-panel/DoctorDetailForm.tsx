"use client";

import { useState } from "react";
import { useUser, UserUpdateInput } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { SPECIALTIES } from "@/lib/doctor-specialty";

const ROLES = ["admin", "doctor", "patient"] as const;

interface DoctorDetailFormProps {
  initialUser: User;
}

export function DoctorDetailForm({ initialUser }: DoctorDetailFormProps) {
  const { updateUser, isUpdating } = useUser(initialUser.id);
  const [form, setForm] = useState({
    display_name: initialUser.display_name ?? "",
    role: initialUser.role ?? "",
    image: initialUser.image ?? "",
    specialty: initialUser.specialty ?? "",
    bio: initialUser.bio ?? "",
  });

  const handleSave = () => {
    updateUser({
      id: initialUser.id,
      display_name: form.display_name || null,
      role: form.role || null,
      image: form.image || null,
      specialty: form.specialty || null,
      bio: form.bio || null,
    } as UserUpdateInput & { id: string; specialty?: string | null; bio?: string | null });
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Edit Profile</h3>
      <div className="grid gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={form.display_name}
            onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
            placeholder="Full name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="specialty">Specialty</Label>
          <Select value={form.specialty} onValueChange={(v) => setForm((p) => ({ ...p, specialty: v }))}>
            <SelectTrigger id="specialty">
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Short professional biography…"
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
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

        <div className="space-y-1.5">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            value={form.image}
            onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
            placeholder="/doctors/img-1.jpg or https://…"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} disabled={isUpdating} className="flex-1 sm:flex-none">
          {isUpdating ? "Saving…" : "Save changes"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" type="button" className="text-destructive hover:text-destructive">
              Reset
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
                    specialty: initialUser.specialty ?? "",
                    bio: initialUser.bio ?? "",
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
