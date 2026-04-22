"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { useAppointments } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import { useUsers } from "@/hooks/useUsers";
import { Search, Calendar, User, Stethoscope, ArrowRight } from "lucide-react";
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

  const { appointments } = useAppointments();
  const { patients } = usePatients();
  const { data: usersData } = useUsers();

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
          href: `/control-panel/appointments/${a.id}`,
        });
      }
    });

    // Patients
    (patients ?? []).forEach((p) => {
      const full = `${p.firstname} ${p.lastname}`.toLowerCase();
      if (full.includes(q) || p.email?.toLowerCase().includes(q)) {
        out.push({
          kind: "patient",
          id: p.id,
          label: `${p.firstname} ${p.lastname}`,
          sub: p.email ?? (p.active ? "Active" : "Inactive"),
          href: `/control-panel/patients/${p.id}`,
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
          href: `/control-panel/doctors/${u.id}`,
        });
      }
    });

    return out.slice(0, 20);
  }, [query, appointments, patients, usersData]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setQuery(""); closeSearch(); } }}>
      <DialogContent className="p-0 max-w-xl overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search appointments, patients, doctors…"
            className="border-0 shadow-none focus-visible:ring-0 text-base h-auto p-0"
            id="global-search-input"
            aria-label="Search appointments, patients, doctors"
            title="Global search"
          />
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search…
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
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left group border-b last:border-b-0"
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
        <div className="px-4 py-2 border-t flex items-center gap-4 text-xs text-muted-foreground bg-muted/30">
          <span>
            <kbd className="px-1 py-0.5 font-mono bg-muted border rounded">↵</kbd> to navigate
          </span>
          <span>
            <kbd className="px-1 py-0.5 font-mono bg-muted border rounded">⌘K</kbd> to toggle
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
