"use client";

import React, { useState } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInvitations } from "@/hooks/useInvitations";
import { apiClient } from "@/lib/api-client";
import { useDebounce } from "@/hooks/useDebounce";

const permissions = [
  { value: "read", label: "Read Only" },
  { value: "write", label: "Read-Write" },
  { value: "full", label: "Full Access (CRUD)" },
];

export default function AppointmentAccessPermission() {
  const [email, setEmail] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ id: string; title: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [permission, setPermission] = useState<"read" | "write" | "full">("read");

  const debouncedSearch = useDebounce(search, 300);
  const { sendInvitation, isSending } = useInvitations("appointment");

  React.useEffect(() => {
    if (debouncedSearch.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    apiClient<{ appointments: { id: string; title: string }[] }>(
      `/api/appointments/search?query=${encodeURIComponent(debouncedSearch)}`
    )
      .then((data) => {
        if (!cancelled) setResults(data.appointments || []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });
    return () => { cancelled = true; };
  }, [debouncedSearch]);

  const handleSend = () => {
    sendInvitation({
      type: "appointment",
      email,
      resourceId: appointmentId,
      permission,
    });
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Appointment Access Invitation</CardTitle>
        <CardDescription>Invite someone to access a specific appointment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="appt-email">Invitee Email</Label>
          <Input
            id="appt-email"
            type="email"
            placeholder="user@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2 relative">
          <Label htmlFor="appt-search">Appointment</Label>
          <Input
            id="appt-search"
            placeholder="Search appointment by title or ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
          />
          {showDropdown && results.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-lg max-h-40 overflow-y-auto">
              {results.map((a) => (
                <li
                  key={a.id}
                  className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                  onClick={() => {
                    setAppointmentId(a.id);
                    setSearch(a.title || a.id);
                    setShowDropdown(false);
                  }}
                >
                  {a.title} <span className="text-muted-foreground">({a.id})</span>
                </li>
              ))}
            </ul>
          )}
          {appointmentId && (
            <p className="text-xs text-muted-foreground">Selected: {appointmentId}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Permission</Label>
          <Select value={permission} onValueChange={(v: "read" | "write" | "full") => setPermission(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {permissions.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSend} disabled={isSending || !email || !appointmentId}>
          {isSending ? "Sending..." : "Send Appointment Access Invitation"}
        </Button>
      </CardContent>
    </Card>
  );
}
