"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Removed Dialog imports for full-page layout
import Link from "next/link";
import { useRouter } from "next/navigation";

  export function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
  
    const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      setSuccess("");
      
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
      setLoading(false);

        if (!response.ok) {
          setError(data.error || "Registration failed");
          return;
        }

        setSuccess(data.message || "Check your email to confirm your registration. You must verify your email before logging in.");
      } catch (err: any) {
        setLoading(false);
        setError(err.message || "An error occurred during registration");
      }
    };
  
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 relative">
          <h1 className="text-3xl font-bold mb-2 text-center">Register</h1>
          <p className="text-gray-500 mb-6 text-center">Create a new account to manage your appointments.</p>
          <form onSubmit={handleRegister} className="space-y-4">
            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              id="register-email"
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">Password</label>
            <Input
              id="register-password"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <div className="text-center pt-4 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 underline">Login</Link>
          </div>
          <Button variant="ghost" className="absolute top-4 right-4 p-2" aria-label="Close" onClick={() => router.push("/login")}>✕</Button>
        </div>
      </div>
    );
  }

