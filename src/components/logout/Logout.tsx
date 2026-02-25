"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Logout() {
  const router = useRouter();
  const { logout, isLoggingOut } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 relative">
        <h1 className="text-3xl font-bold mb-2 text-center">Logout</h1>
        <p className="text-gray-500 mb-6 text-center">Are you sure you want to log out?</p>
        <div className="flex flex-col gap-4 mt-4">
          <Button onClick={() => logout()} className="w-full" disabled={isLoggingOut}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => router.back()} disabled={isLoggingOut}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
