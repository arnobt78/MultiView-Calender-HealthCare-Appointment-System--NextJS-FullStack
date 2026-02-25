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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const testAccounts: Record<string, { email: string; password: string; label: string }> = {
  "guest-user": {
    email: "test@user.com",
    password: "12345678",
    label: "Guest User",
  },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const queryClient = useQueryClient();

  const handleRoleSelect = (value: string) => {
    if (value === "clear") {
      setSelectedRole("");
      setEmail("");
      setPassword("");
      return;
    }
    setSelectedRole(value);
    const account = testAccounts[value];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

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

  const handleGoogle = () => {
    const redirectParam = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
    window.location.href = `/api/auth/google${redirectParam}`;
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
          <CardTitle className="text-xl">Welcome Back!</CardTitle>
          <CardDescription className="text-md">Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-md font-medium text-gray-700">
                Test Accounts To Login With
              </label>
              <Select
                key={`select-${selectedRole || "empty"}`}
                value={selectedRole || undefined}
                onValueChange={handleRoleSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role Based Test Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest-user">Guest User (test@user.com)</SelectItem>
                  {selectedRole && (
                    <SelectItem value="clear" className="text-muted-foreground">
                      Clear Selection
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-md font-medium text-gray-700">
                Email
              </label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="john@doe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-md font-medium text-gray-700">
                Password
              </label>
              <Input
                id="login-password"
                name="password"
                type="password"
                placeholder="12345678"
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
              className="w-full border border-gray-200 hover:bg-gray-200 transition-colors"
              onClick={handleGoogle}
              disabled={loading}
            >
              <GoogleIcon className="mr-2 h-4 w-4 shrink-0" />
              {loading ? "Redirecting..." : "Login with Google"}
            </Button>
          </form>
          <p className="text-center pt-4 text-sm">
            Not yet have an account?{" "}
            <Link href="/register" className="text-sky-600 hover:text-sky-700 hover:font-medium transition-colors">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
