"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { useAppointments } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { useInitialNavRole } from "@/context/NavRoleContext";
import { isPatientRole } from "@/lib/rbac";
import {
  appointmentDetailHref,
  doctorDetailHref,
  patientDetailHref,
} from "@/lib/entity-routes";
import { Search, Calendar, User, Stethoscope, ArrowRight, X } from "lucide-react";
import { format } from "date-fns";

type ResultItem =
  | { kind: "appointment"; id: string; label: string; sub: string; href: string }
  | { kind: "patient"; id: string; label: string; sub: string; href: string }
  | { kind: "doctor"; id: string; label: string; sub: string; href: string };

const KIND_ICONS = {
  appointment: Calendar,
  patient: User,
  doctor: Stethoscope,
} as const;

const KIND_COLORS = {
  appointment: "bg-blue-100 text-blue-700",
  patient: "bg-teal-100 text-teal-700",
  doctor: "bg-purple-100 text-purple-700",
} as const;

export default function GlobalSearch() {
  const isOpen = useAppStore((s) => s.isSearchOpen);
  const closeSearch = useAppStore((s) => s.closeSearch);
  const router = useRouter();

  const [query, setQuery] = useState("");

  const { user } = useAuth();
  const initialNavRole = useInitialNavRole();
  // SSR `initialNavRole` + live auth — skip staff list fetches for patients (avoids 403 while auth loads).
  const role = user?.role ?? initialNavRole;
  const isPatient = isPatientRole(role);

  const { appointments } = useAppointments();
  const { patients: allPatients } = usePatients();
  const { data: usersData } = useUsers({}, { enabled: !isPatient });

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const openSearch = useAppStore.getState().openSearch;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (useAppStore.getState().isSearchOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }
      if (e.key === "Escape") {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeSearch]);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      closeSearch();
      setQuery("");
    },
    [router, closeSearch],
  );

  const results = useMemo<ResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const out: ResultItem[] = [];

    // Appointments
    (appointments ?? []).forEach((a) => {
      if (
        a.title.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q) ||
        a.notes?.toLowerCase().includes(q)
      ) {
        out.push({
          kind: "appointment",
          id: a.id,
          label: a.title,
          sub: `${format(new Date(a.start), "dd MMM yyyy · HH:mm")}${a.location ? ` · ${a.location}` : ""}`,
          href: appointmentDetailHref(user?.role, a.id),
        });
      }
    });

    // Patients — filter inside memo so deps stay stable (patient role skips list)
    (isPatient ? [] : allPatients).forEach((p) => {
      const full = `${p.firstname} ${p.lastname}`.toLowerCase();
      if (full.includes(q) || p.email?.toLowerCase().includes(q)) {
        out.push({
          kind: "patient",
          id: p.id,
          label: `${p.firstname} ${p.lastname}`,
          sub: p.email ?? (p.active ? "Active" : "Inactive"),
          href: patientDetailHref(user?.role, p.id),
        });
      }
    });

    // Doctors / users
    (usersData?.users ?? []).forEach((u) => {
      const name = (u.display_name ?? u.email).toLowerCase();
      if (name.includes(q) || u.email.toLowerCase().includes(q)) {
        out.push({
          kind: "doctor",
          id: u.id,
          label: u.display_name ?? u.email,
          sub: u.role ? `${u.role} · ${u.email}` : u.email,
          href: doctorDetailHref(user?.role, u.id),
        });
      }
    });

    return out.slice(0, 20);
  }, [query, appointments, allPatients, isPatient, usersData, user?.role]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setQuery(""); closeSearch(); } }}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[90vh] w-[92vw] max-w-[1200px] flex-col gap-0 overflow-hidden rounded-[28px] border border-sky-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(2,132,199,0.35)]"
      >
        <div className="bg-white pt-6">
          <div className="px-6">
            <div className="flex items-start gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700">
                <Search className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-lg font-semibold text-gray-700">
                    Global Search
                  </DialogTitle>
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    ⌘K
                  </kbd>
                </div>
                <DialogDescription className="text-sm">
                  Search appointments, patients and doctors from one place. Use keywords like name, title, location, notes, or role.
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8 rounded-full text-muted-foreground hover:bg-sky-100 hover:text-sky-700"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="mx-6 mt-4 border-b border-sky-200/60" />
        </div>

        {/* Search input */}
        <div className="mx-6 border-b border-sky-200/60">
          <div className="flex items-center gap-2 py-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search appointments, patients, doctors…"
              className="h-8 rounded-none border-0 px-1 py-0 text-base leading-6 text-gray-700 shadow-none focus-visible:ring-0"
              id="global-search-input"
              aria-label="Search appointments, patients, doctors"
              title="Global search"
            />
            <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-xs font-mono sm:inline-flex">
              ESC
            </kbd>
            {query.trim().length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:bg-sky-100 hover:text-sky-700"
                onClick={() => setQuery("")}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <ul>
              {results.map((item) => {
                const Icon = KIND_ICONS[item.kind];
                return (
                  <li key={`${item.kind}-${item.id}`}>
                    <button
                      type="button"
                      className="group flex w-full items-center gap-2 border-b border-sky-100/70 px-6 py-3 text-left transition-colors hover:bg-sky-50/60 last:border-b-0"
                      onClick={() => navigate(item.href)}
                    >
                      <span className={`rounded-full p-1.5 shrink-0 ${KIND_COLORS[item.kind]}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs shrink-0 capitalize ${KIND_COLORS[item.kind]}`}>
                        {item.kind}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="shrink-0 bg-sky-50/40 px-6 py-2 text-xs text-muted-foreground border-t border-sky-200/60">
          <div className="flex items-center justify-center gap-4">
            <span>
              <kbd className="px-1 py-0.5 font-mono bg-muted border rounded">↵</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 font-mono bg-muted border rounded">⌘K</kbd> to toggle
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
