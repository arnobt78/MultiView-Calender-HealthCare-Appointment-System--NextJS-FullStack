"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        toast.error(data.error || "Login failed");
        return;
      }

      if (data.user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
        toast.success(`Welcome back, ${data.user.email}!`);

        if (redirect) {
          window.location.href = redirect;
          return;
        }
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "An error occurred during login";
      toast.error(message);
    }
  };

  const handleGoogle = async () => {
    toast.error("Google OAuth is not yet implemented. Please use email/password login.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          aria-label="Close"
          onClick={() => router.push("/")}
        >
          ✕
        </Button>
        <CardHeader>
          <CardTitle className="text-3xl">Sign in</CardTitle>
          <CardDescription>Sign in to your account to access your calendar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="login-password"
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleGoogle}
              disabled={loading}
            >
              {loading ? "Redirecting..." : "Login with Google"}
            </Button>
          </form>
          <p className="text-center pt-4 text-sm">
            Not yet have an account?{" "}
            <Link href="/register" className="text-blue-600 underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
