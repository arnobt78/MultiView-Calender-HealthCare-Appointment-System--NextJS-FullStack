"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutDashboard, Settings, BookOpen, Activity, LogOut, Bell, CheckCheck, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useAppStore } from "@/store/useAppStore";
import GlobalSearch from "@/components/shared/GlobalSearch";

export default function Navbar() {
  const { user, logout, isLoggingOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const openSearch = useAppStore((s) => s.openSearch);
  const toggleQuickActionModal = useAppStore((s) => s.toggleQuickActionModal);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Avatar: use profile image, else Robohash by email (when user exists)
  const avatarSrc =
    user?.image ||
    (user ? `https://robohash.org/${encodeURIComponent(user.email)}.png?set=set1` : "");
  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="w-full flex-col bg-transparent">
      <div className="flex py-4 items-center justify-between mx-2 sm:mx-4 lg:mx-8 border-b border-gray-100">

        {/* Left: logo */}
        <div className="flex flex-1 items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-6 w-6" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-primary">HealthCal Pro</span>
          </Link>
        </div>

        {/* Center: nav links */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6">
          <Link
            href="/dashboard"
            className={`text-base font-medium transition-colors hover:text-primary ${pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}
          >
            Dashboard
          </Link>
          <Link
            href="/control-panel"
            className={`text-base font-medium transition-colors hover:text-primary ${pathname?.includes("/control-panel") ? "text-primary" : "text-muted-foreground"}`}
          >
            Control Panel
          </Link>
          <Link
            href="/insights"
            className={`text-base font-medium transition-colors hover:text-primary ${pathname?.includes("/insights") ? "text-primary" : "text-muted-foreground"}`}
          >
            Analytics
          </Link>
          <Link
            href="/patient-portal"
            className={`text-base font-medium transition-colors hover:text-primary ${pathname?.includes("/patient-portal") ? "text-primary" : "text-muted-foreground"}`}
          >
            Patient Portal
          </Link>
        </nav>

        {/* Right: search + notifications + avatar */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleQuickActionModal}
            className="hidden sm:flex items-center gap-1.5 rounded-md border border-input bg-muted/40 px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Open quick actions (Ctrl+J)"
            title="Quick Actions (⌘J)"
          >
            <LayoutDashboard className="h-4 w-4" />
            <kbd className="text-[10px] font-mono">⌘J</kbd>
          </button>

          {/* Global Search Button */}
          <button
            type="button"
            onClick={openSearch}
            className="hidden sm:flex items-center gap-2 rounded-md border border-input bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Open global search (Ctrl+K)"
            title="Search (⌘K)"
          >
            <Search className="h-4 w-4" />
            <span>Search…</span>
            <kbd className="ml-1 px-1 py-0.5 text-[10px] font-mono bg-background border rounded">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={openSearch}
            className="sm:hidden rounded-full p-2 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Open global search"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>

          {user && (
            <>
              {/* Notification Bell */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative rounded-full p-2 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markAllAsRead();
                        }}
                        className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="h-3 w-3" /> Mark all read
                      </button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className={`flex flex-col items-start gap-1 px-3 py-2.5 cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
                        onClick={() => {
                          if (!n.read) markAsRead(n.id);
                          if (n.link) router.push(n.link);
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                          <span className="text-sm font-medium truncate flex-1">{n.title}</span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {n.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 w-full">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Avatar Menu */}
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
            </>
          )}
        </div>
      </div>
      <GlobalSearch />
    </div>
  );
}
