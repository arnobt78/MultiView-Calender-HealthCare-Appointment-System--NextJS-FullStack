"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutDashboard, Settings, BookOpen, Activity, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout, isLoggingOut } = useAuth();
  const pathname = usePathname();

  // Avatar: use profile image, else Robohash by email (when user exists)
  const avatarSrc =
    user?.image ||
    (user ? `https://robohash.org/${encodeURIComponent(user.email)}.png?set=set1` : "");
  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="w-full flex-col bg-white">
      <div className="flex py-4 items-center justify-between mx-2 sm:mx-4 lg:mx-8 border-b border-gray-100">

        {/* Left: logo */}
        <div className="flex flex-1 items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-6 w-6" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-primary">Appointment Calendar</span>
          </Link>
        </div>

        {/* Center: nav links */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6">
          <Link
            href="/"
            className={`text-base font-medium transition-colors hover:text-primary ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}
          >
            Dashboard
          </Link>
          <Link
            href="/control-panel"
            className={`text-base font-medium transition-colors hover:text-primary ${pathname?.includes("/control-panel") ? "text-primary" : "text-muted-foreground"}`}
          >
            Control Panel
          </Link>
        </nav>

        {/* Right: avatar */}
        <div className="flex flex-1 items-center justify-end">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full ring-2 ring-border shadow-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer bg-gray-100 hover:bg-gray-200/50"
                  aria-label="Account menu"
                >
                  <Avatar>
                    <AvatarImage src={avatarSrc} alt="" referrerPolicy="no-referrer" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-medium leading-none">{user.display_name || "User"}</p>
                    <p className="text-sm text-muted-foreground leading-none">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/control-panel"><Settings className="mr-2 h-4 w-4" /> Control Panel</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/api-docs"><BookOpen className="mr-2 h-4 w-4" /> API Documentation</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/api-status"><Activity className="mr-2 h-4 w-4" /> API Status</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
