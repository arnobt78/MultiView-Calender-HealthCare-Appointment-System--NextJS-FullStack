"use client";

import Link from "next/link";
import Image from "next/image";
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
import { LayoutDashboard, Settings, BookOpen, Activity, LogOut, Bell, BellRing, CheckCheck, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useAppStore } from "@/store/useAppStore";
import GlobalSearch from "@/components/shared/GlobalSearch";

export default function Navbar() {
  const { user, logout, isLoggingOut, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const openSearch = useAppStore((s) => s.openSearch);
  const toggleQuickActionModal = useAppStore((s) => s.toggleQuickActionModal);
  const { notifications, total, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Avatar: use profile image, else Robohash by email (when user exists)
  const avatarSrc =
    user?.image ||
    (user ? `https://robohash.org/${encodeURIComponent(user.email)}.png?set=set1` : "");
  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="w-full flex-col sticky top-0 z-40 bg-transparent backdrop-blur-sm">
      <div className="flex py-2 items-center justify-between mx-2 sm:mx-4 lg:mx-8 border-b border-gray-100">

        {/* Left: logo */}
        <div className="flex flex-1 items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="relative inline-flex shrink-0 items-center justify-center">
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/50 blur-2xl"
              />
              {/* <span className="relative z-10 flex h-8 w-8 items-center justify-center shadow-[0_0_28px_rgba(2,132,199,0.55),0_10px_40px_rgba(2,132,199,0.35)]"> */}
              <Image
                src="/logo.svg"
                alt="HealthCal Pro Logo"
                width={28}
                height={28}
                className="h-8 w-8 object-contain"
                priority
              />
              {/* </span> */}
            </span>
            <span className="inline-block bg-linear-to-r from-emerald-900 via-red-500 to-sky-700 bg-clip-text text-lg font-semibold tracking-tight text-transparent">
              HealthCal Pro
            </span>
          </Link>
        </div>

        {/* Center: nav links */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6">
          <Link
            href="/dashboard"
            className={`text-base transition-colors hover:text-gray-700 ${pathname === "/dashboard" ? "text-gray-700" : "text-muted-foreground"}`}
          >
            Dashboard
          </Link>
          <Link
            href="/control-panel"
            className={`text-base transition-colors hover:text-gray-700 ${pathname?.includes("/control-panel") ? "text-gray-700" : "text-muted-foreground"}`}
          >
            Control Panel
          </Link>
          <Link
            href="/insights"
            className={`text-base transition-colors hover:text-gray-700 ${pathname?.includes("/insights") ? "text-gray-700" : "text-muted-foreground"}`}
          >
            Analytics
          </Link>
          <Link
            href="/patient-portal"
            className={`text-base transition-colors hover:text-gray-700 ${pathname?.includes("/patient-portal") ? "text-gray-700" : "text-muted-foreground"}`}
          >
            Patient Portal
          </Link>
        </nav>

        {/* Right: search + notifications + avatar */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleQuickActionModal}
            className="hidden sm:flex items-center gap-1.5 rounded-2xl border border-input bg-muted/40 px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
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
            className="hidden sm:flex items-center gap-2 rounded-2xl border border-input bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
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

          {(isLoading || user) && (
            <>
              {/* Notification Bell */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative rounded-full p-2 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    aria-label="Notifications"
                    disabled={!user}
                  >
                    <Bell className={`h-5 w-5 ${user ? "text-muted-foreground" : "text-transparent"}`} />
                    {user && unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                    {!user && (
                      <span className="absolute inset-0 rounded-full bg-gray-200/90 animate-pulse" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                {user && (
                  <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex flex-col gap-2 px-2 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">
                              <BellRing className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="truncate text-sm font-semibold">Notifications</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className="min-h-6 min-w-8 justify-center tabular-nums text-xs font-semibold"
                            >
                              {total}
                            </Badge>
                            {unreadCount > 0 ? (
                              <Badge
                                variant="destructive"
                                className="min-h-6 min-w-8 justify-center tabular-nums text-xs font-semibold"
                              >
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        {unreadCount > 0 ? (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markAllAsRead();
                              }}
                              className="flex cursor-pointer items-center gap-1 text-xs text-gray-700 hover:underline"
                            >
                              <CheckCheck className="h-3 w-3" /> Mark all read
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length === 0 ? (
                      <div className="space-y-3 px-3 py-5 text-left text-sm text-muted-foreground">
                        <p className="text-center font-medium text-foreground">No notifications yet</p>
                        <p className="text-xs leading-relaxed">
                          You will see updates here for in-app activity such as:
                        </p>
                        <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed">
                          <li>New patient bookings from the patient portal</li>
                          <li>Upcoming appointment reminders for you and accepted assignees</li>
                          <li>Other alerts created by your workspace or integrations</li>
                        </ul>
                        <p className="text-[11px] leading-relaxed text-muted-foreground/90">
                          Reminders follow your reminder schedule; new items also appear when this menu is open or on the next refresh (about every 30 seconds).
                        </p>
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
                )}
              </DropdownMenu>

              {/* User Avatar Menu */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full ring-2 ring-border shadow-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer bg-gray-100 hover:bg-gray-200/50"
                    aria-label="Account menu"
                    disabled={!user}
                  >
                    {user ? (
                      <Avatar>
                        <AvatarImage src={avatarSrc} alt="" referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-primary/10 text-gray-700 font-medium">{initials}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200/90 animate-pulse" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                {user && (
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <p className="text-base leading-none text-gray-700">{user.display_name || "User"}</p>
                        <p className="text-sm text-muted-foreground leading-none">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild className="cursor-pointer text-gray-700">
                      <Link href="/api-docs"><BookOpen className="h-4 w-4" /> API Documentation</Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer text-gray-700">
                      <Link href="/api-status"><Activity className="h-4 w-4" /> API Status</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      disabled={isLoggingOut}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Log out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
      <GlobalSearch />
    </div>
  );
}
