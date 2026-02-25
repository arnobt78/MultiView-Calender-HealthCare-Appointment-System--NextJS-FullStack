"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUsers";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

export default function DoctorDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { data: user, isLoading, isError, error } = useUser(id);

  if (!id) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-destructive">Invalid user ID.</p>
        <Button variant="link" asChild><Link href="/control-panel">Back to Control Panel</Link></Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-destructive">{error?.message ?? "Failed to load user."}</p>
        <Button variant="link" asChild><Link href="/control-panel">Back to Control Panel</Link></Button>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-muted-foreground">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <PageHeader
        title={user.display_name || user.email || "User"}
        description="User / Doctor — all table schema properties"
        actions={
          <Button variant="outline" asChild>
            <Link href="/control-panel">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Schema: users</CardTitle>
          <p className="text-sm text-muted-foreground">
            id, email, role, display_name, image, created_at (email_verified managed via auth)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image ?? undefined} alt="" />
              <AvatarFallback>{(user.display_name || user.email || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.display_name || "—"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <dl className="grid gap-2 text-sm">
            <div><dt className="font-medium text-muted-foreground">id</dt><dd className="font-mono break-all">{user.id}</dd></div>
            <div><dt className="font-medium text-muted-foreground">email</dt><dd>{user.email}</dd></div>
            <div><dt className="font-medium text-muted-foreground">display_name</dt><dd>{user.display_name ?? "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">role</dt><dd>{user.role ?? "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">image</dt><dd>{user.image ? "Yes" : "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">created_at</dt><dd>{user.created_at ? new Date(user.created_at).toISOString() : "—"}</dd></div>
          </dl>
          <p className="text-muted-foreground text-sm">User profile updates (e.g. role, display_name) can be managed via auth or admin scripts.</p>
        </CardContent>
      </Card>
    </div>
  );
}
