"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types/types";
import { isUserAccountActive } from "@/lib/entity-active-status";

export type AdminUserStatusFilter = "all" | "active" | "inactive";
export type AdminUserVerificationFilter = "all" | "verified" | "unverified";
export type AdminUserPhotoFilter = "all" | "with_photo" | "no_photo";

type Ctx = {
  status: AdminUserStatusFilter;
  setStatus: (s: AdminUserStatusFilter) => void;
  verification: AdminUserVerificationFilter;
  setVerification: (v: AdminUserVerificationFilter) => void;
  photo: AdminUserPhotoFilter;
  setPhoto: (p: AdminUserPhotoFilter) => void;
  filterUsers: (list: User[]) => User[];
};

const AdminUserListFiltersContext = createContext<Ctx | null>(null);

/** Client-side admin roster filters — status, email verification, profile photo. */
export function AdminUserListFiltersProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminUserStatusFilter>("all");
  const [verification, setVerification] = useState<AdminUserVerificationFilter>("all");
  const [photo, setPhoto] = useState<AdminUserPhotoFilter>("all");

  const filterUsers = useCallback(
    (list: User[]) => {
      let out = list;
      if (status === "active") out = out.filter((u) => isUserAccountActive(u));
      if (status === "inactive") out = out.filter((u) => !isUserAccountActive(u));
      if (verification === "verified") out = out.filter((u) => u.email_verified === true);
      if (verification === "unverified") out = out.filter((u) => !u.email_verified);
      if (photo === "with_photo") out = out.filter((u) => Boolean(u.image?.trim()));
      if (photo === "no_photo") out = out.filter((u) => !u.image?.trim());
      return out;
    },
    [status, verification, photo]
  );

  const value = useMemo(
    () => ({
      status,
      setStatus,
      verification,
      setVerification,
      photo,
      setPhoto,
      filterUsers,
    }),
    [status, verification, photo, filterUsers]
  );

  return (
    <AdminUserListFiltersContext.Provider value={value}>
      {children}
    </AdminUserListFiltersContext.Provider>
  );
}

export function useAdminUserListFilters() {
  const ctx = useContext(AdminUserListFiltersContext);
  if (!ctx) {
    throw new Error("useAdminUserListFilters requires AdminUserListFiltersProvider");
  }
  return ctx;
}
