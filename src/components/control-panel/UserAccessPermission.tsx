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

interface UserSearchResult {
  id: string;
  email: string;
  display_name?: string;
}

export default function UserAccessPermission() {
  const [email, setEmail] = useState("");
  const [ownerUserId, setOwnerUserId] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [permission, setPermission] = useState<"read" | "write" | "full">("read");

  const debouncedSearch = useDebounce(search, 300);
  const { sendInvitation, isSending } = useInvitations("dashboard");

  React.useEffect(() => {
    if (debouncedSearch.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    let cancelled = false;
    apiClient<{ users: UserSearchResult[] }>(
      `/api/users/search?query=${encodeURIComponent(debouncedSearch)}`
    )
      .then((data) => {
        if (!cancelled) setResults(data.users || []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });
    return () => { cancelled = true; };
  }, [debouncedSearch]);

  const handleSend = () => {
    sendInvitation({
      type: "dashboard",
      email,
      resourceId: ownerUserId,
      permission,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">User Dashboard Access Invitation</CardTitle>
        <CardDescription className="text-base text-muted-foreground">Invite someone to access a user&apos;s dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-email" className="text-base font-medium">Invitee Email</Label>
          <Input
            id="user-email"
            type="email"
            placeholder="user@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2 relative">
          <Label htmlFor="user-search" className="text-base font-medium">Dashboard Owner User</Label>
          <Input
            id="user-search"
            placeholder="Search user by email or name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
          />
          {showDropdown && results.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 border rounded-md bg-white shadow-xl max-h-40 overflow-y-auto">
              {results.map((u) => (
                <li
                  key={u.id}
                  className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                  onClick={() => {
                    setOwnerUserId(u.id);
                    setSearch(u.display_name || u.email || u.id);
                    setShowDropdown(false);
                  }}
                >
                  {u.display_name || u.email} <span className="text-muted-foreground">({u.id})</span>
                </li>
              ))}
            </ul>
          )}
          {ownerUserId && (
            <p className="text-xs text-muted-foreground">Selected: {ownerUserId}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-base font-medium">Permission</Label>
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
        <Button onClick={handleSend} disabled={isSending || !email || !ownerUserId}>
          {isSending ? "Sending..." : "Send User Dashboard Access Invitation"}
        </Button>
      </CardContent>
    </Card>
  );
}
