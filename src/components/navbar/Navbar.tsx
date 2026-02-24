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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutDashboard, Settings, BookOpen, Activity, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout, isLoggingOut } = useAuth();
  const pathname = usePathname();

  // Helper to get initials
  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  // Helper to generate a simple breadcrumb
  const getCurrentPageName = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname.includes("control-panel")) return "Control Panel";
    if (pathname.includes("api-docs")) return "API Docs";
    if (pathname.includes("api-status")) return "API Status";
    return "App";
  };

  return (
    <div className="w-full flex-col border-b bg-white mb-2">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-6 w-6" />
            </span>
            <span className="text-xl font-bold tracking-tight text-primary">Vocare Calendar</span>
          </Link>

          <div className="hidden md:block border-l pl-6 ml-2 h-6" />

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}
            >
              Dashboard
            </Link>
            <Link
              href="/control-panel"
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname?.includes("/control-panel") ? "text-primary" : "text-muted-foreground"}`}
            >
              Control Panel
            </Link>
            <Link
              href="/api-docs"
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname?.includes("/api-docs") ? "text-primary" : "text-muted-foreground"}`}
            >
              API Docs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-medium">{user.display_name || "User"}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
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

      {/* Breadcrumb Row */}
      <div className="flex px-8 py-2 bg-slate-50/50 border-t items-center text-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{getCurrentPageName()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
