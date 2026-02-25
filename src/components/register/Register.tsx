"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, display_name: name.trim() || undefined }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success(data.message || "Account created! Check your email to verify.");
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "An error occurred during registration";
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          aria-label="Close"
          onClick={() => router.push("/login")}
        >
          ✕
        </Button>
        <CardHeader>
          <CardTitle className="text-3xl">Register</CardTitle>
          <CardDescription>Create a new account to manage your appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="register-name" className="text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                id="register-name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="register-email"
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
              <label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="register-password"
                name="password"
                type="password"
                placeholder="12345678"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <p className="text-center pt-4 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-sky-600 hover:text-sky-700 hover:font-medium transition-colors">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

