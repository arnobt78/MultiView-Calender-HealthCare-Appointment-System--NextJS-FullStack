"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Removed Dialog imports for full-page layout
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { setClientSession } from "@/lib/session";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Set session cookie (client-side)
      if (data.user) {
        // Get token from response headers or set via cookie
        // The server already set the cookie, but we can also store it client-side for immediate access
        const tokenResponse = await fetch("/api/auth/me");
        if (tokenResponse.ok) {
          if (redirect) {
            // Always reload the page after redirect to ensure invitation page is shown
            window.location.href = redirect;
            return;
          }
          router.push("/");
          router.refresh(); // Refresh to update auth state
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "An error occurred during login");
    }
  };

  // Google OAuth removed - can be re-implemented later if needed
  const handleGoogle = async () => {
    setError("Google OAuth is not yet implemented. Please use email/password login.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 relative">
        <h1 className="text-3xl font-bold mb-2 text-center">Sign in</h1>
        <p className="text-gray-500 mb-6 text-center">Sign in to your account to access your calendar.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">Email</label>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
          />
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={handleGoogle} disabled={loading}>
            {loading ? "Redirecting..." : "Login with Google"}
          </Button>
        </form>
        <div className="text-center pt-4 text-sm">
          Not yet have an account?{' '}
          <Link href="/register" className="text-blue-600 underline">Register</Link>
        </div>
        <Button variant="ghost" className="absolute top-4 right-4 p-2" aria-label="Close" onClick={() => router.push("/")}>✕</Button>
      </div>
    </div>
  );
}
