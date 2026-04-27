"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/lib/notify";
import { apiClient, handleApiError } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AcceptInvitationPageProps = {
  token?: string | null;
};

export default function AcceptInvitationPage({ token = null }: AcceptInvitationPageProps) {
  const router = useRouter();
  const { user, isLoading: checkingAuth } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAccept = async () => {
    if (!token || !user?.id) {
      setStatus("error");
      setMessage("Missing invitation token or user session. Please log in.");
      return;
    }
    setStatus("loading");
    try {
      const data = await apiClient<{ message?: string }>("/api/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token, userId: user.id }),
      });
      setStatus("success");
      setMessage(data.message || "Invitation accepted!");
      notify.success({
        title: "Invitation accepted",
        subtitle: "You now have access to the shared workspace.",
      });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to accept invitation.");
      handleApiError(err, "Accept invitation");
    }
  };

  return (
    <div className="max-w-9xl mx-auto mt-16 py-8 px-2 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Accept Invitation</CardTitle>
          <CardDescription>
            {checkingAuth
              ? "Checking authentication..."
              : "Use the actions below to accept your invitation."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {checkingAuth ? (
            <p className="text-muted-foreground">Checking authentication...</p>
          ) : !user ? (
            <>
              <p className="text-destructive">You must be logged in to accept this invitation.</p>
              <Button asChild className="w-full">
                <Link
                  href={`/login?redirect=/accept-invitation${token ? `?token=${encodeURIComponent(token)}` : ""}`}
                >
                  Login to continue
                </Link>
              </Button>
            </>
          ) : status === "idle" ? (
            <>
              <p className="text-muted-foreground">Click below to accept your invitation.</p>
              <Button onClick={handleAccept} disabled={!token}>
                Accept Invitation
              </Button>
            </>
          ) : status === "loading" ? (
            <p className="text-muted-foreground">Accepting invitation...</p>
          ) : status === "success" ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-green-700">{message}</p>
              <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            </div>
          ) : (
            <p className="text-destructive">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
