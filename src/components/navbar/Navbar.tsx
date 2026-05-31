"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useNavSession } from "@/hooks/useNavSession";
import { useNotifications } from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, BookOpen, Activity, LogOut,
  Bell, BellRing, CheckCheck, Search,
  // Notification type icons
  CalendarPlus, CalendarCheck2, AlarmClock, RefreshCcw, Trash2,
  // Role portal icons
  ShieldCheck, Stethoscope, ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchInsightsNav } from "@/lib/prefetch-insights-nav";

/**
 * Per-type visual config for notification items.
 * Drives: icon, icon background/color, glassmorphic badge style, and unread dot color.
 * Add new types here as the notification system grows — no other code needs changing.
 */
const NOTIF_TYPE_CONFIG: Record<string, {
  label: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  badgeClass: string;
  dotClass: string;
}> = {
  appointment_created: {
    label: "Scheduled",
    icon: CalendarPlus,
    iconBg: "bg-sky-100/80",
    iconColor: "text-sky-600",
    iconBorder: "border-sky-200/80",
    badgeClass: "bg-sky-100/80 text-sky-700 border-sky-200/70 backdrop-blur-sm",
    dotClass: "bg-sky-500",
  },
  status_update: {
    label: "Status",
    icon: RefreshCcw,
    iconBg: "bg-amber-100/80",
    iconColor: "text-amber-600",
    iconBorder: "border-amber-200/80",
    badgeClass: "bg-amber-100/80 text-amber-700 border-amber-200/70 backdrop-blur-sm",
    dotClass: "bg-amber-500",
  },
  booking: {
    label: "Booking",
    icon: CalendarCheck2,
    iconBg: "bg-emerald-100/80",
    iconColor: "text-emerald-600",
    iconBorder: "border-emerald-200/80",
    badgeClass: "bg-emerald-100/80 text-emerald-700 border-emerald-200/70 backdrop-blur-sm",
    dotClass: "bg-emerald-500",
  },
  reminder: {
    label: "Reminder",
    icon: AlarmClock,
    iconBg: "bg-purple-100/80",
    iconColor: "text-purple-600",
    iconBorder: "border-purple-200/80",
    badgeClass: "bg-purple-100/80 text-purple-700 border-purple-200/70 backdrop-blur-sm",
    dotClass: "bg-purple-500",
  },
};

/** Returns the visual config for a given notification type, with a safe default fallback. */
function getNotifConfig(type: string) {
  return NOTIF_TYPE_CONFIG[type] ?? {
    label: type.replace(/_/g, " "),
    icon: Bell,
    iconBg: "bg-gray-100/80",
    iconColor: "text-gray-500",
    iconBorder: "border-gray-200/80",
    badgeClass: "bg-gray-100/80 text-gray-600 border-gray-200/70 backdrop-blur-sm",
    dotClass: "bg-gray-400",
  };
}
import { useAppStore } from "@/store/useAppStore";
import GlobalSearch from "@/components/shared/GlobalSearch";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { navbarContentShellClass } from "@/lib/dashboard-layout";
import { cn } from "@/lib/utils";
import { APP_NAVBAR_INNER_ROW_CLASS, Z_NAVBAR } from "@/lib/portal-z-index";

export default function Navbar() {
  const { logout, isLoggingOut } = useAuth();
  const {
    effectiveUser: user,
    showStaffNavLinks,
    showPatientPortalNavLink,
    showAdminPortalLink,
    showDoctorPortalLink,
    showControlPanelLink,
  } = useNavSession();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const openSearch = useAppStore((s) => s.openSearch);
  const toggleQuickActionModal = useAppStore((s) => s.toggleQuickActionModal);
  const { notifications, total, unreadCount, markAsRead, markAllAsRead, deleteRead, isDeletingRead } = useNotifications();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const readCount = Math.max(total - unreadCount, 0);

  // Avatar: use profile image, else Robohash by email (when user exists)
  const avatarSrc =
    user?.image ||
    (user ? `https://robohash.org/${encodeURIComponent(user.email)}.png?set=set1` : "");
  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div
      data-slot="app-navbar"
      style={{ zIndex: Z_NAVBAR }}
      className="fixed inset-x-0 top-0 flex w-full shrink-0 flex-col border-b border-gray-100/80 bg-white/90 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80"
    >
      {/* supports-backdrop-filter:bg-white/80 */}
      <div
        className={cn(
          navbarContentShellClass,
          APP_NAVBAR_INNER_ROW_CLASS,
          "flex items-center justify-between py-2"
        )}
      >

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

        {/* Center: nav links — role from SSR NavRoleContext + useAuth; same DOM on server and client */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6">
          {/* Dashboard — all authenticated roles */}
          <Link
            href="/dashboard"
            className={`text-base transition-colors hover:text-gray-700 ${pathname === "/dashboard" ? "text-gray-700" : "text-muted-foreground"}`}
          >
            Dashboard
          </Link>

          {/* Admin Portal — admin role only */}
          {showAdminPortalLink && (
            <Link
              href="/admin-portal"
              className={`flex items-center gap-1.5 text-base transition-colors hover:text-gray-700 ${pathname?.startsWith("/admin-portal") ? "text-gray-700" : "text-muted-foreground"}`}
            >
              Admin Portal
            </Link>
          )}

          {/* Doctor Portal — doctor role only (replaces Control Panel for doctors) */}
          {showDoctorPortalLink && (
            <Link
              href="/doctor-portal"
              className={`flex items-center gap-1.5 text-base transition-colors hover:text-gray-700 ${pathname?.startsWith("/doctor-portal") ? "text-gray-700" : "text-muted-foreground"}`}
            >
              Doctor Portal
            </Link>
          )}

          {/* Control Panel — admin only; doctors use Doctor Portal */}
          {showControlPanelLink && (
            <Link
              href="/control-panel"
              className={`text-base transition-colors hover:text-gray-700 ${pathname?.includes("/control-panel") ? "text-gray-700" : "text-muted-foreground"}`}
            >
              Control Panel
            </Link>
          )}

          {/* Analytics — all staff roles (doctor sees own-scoped data via ?scope=own) */}
          {showStaffNavLinks && (
            <Link
              href="/insights"
              onMouseEnter={() => prefetchInsightsNav(queryClient, { role: user?.role ?? null })}
              className={`text-base transition-colors hover:text-gray-700 ${pathname?.includes("/insights") ? "text-gray-700" : "text-muted-foreground"}`}
            >
              Analytics
            </Link>
          )}

          {/* Services — all authenticated roles */}
          <Link
            href="/services"
            className={`text-base transition-colors hover:text-gray-700 ${pathname?.includes("/services") ? "text-gray-700" : "text-muted-foreground"}`}
          >
            Services
          </Link>

          {/* Patient Portal — patients only */}
          {showPatientPortalNavLink && (
            <Link
              href="/patient-portal"
              className={`text-base transition-colors hover:text-gray-700 ${pathname?.includes("/patient-portal") ? "text-gray-700" : "text-muted-foreground"}`}
            >
              Patient Portal
            </Link>
          )}
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

          {/*
           * Notification bell and avatar are ALWAYS rendered — no conditional wrapper.
           *
           * Previously wrapped in `{(isLoading || user) && (...)}`:
           *   - SSR:    isLoading=false, user=null  → condition false → buttons ABSENT in server HTML
           *   - Client: isLoading=true initially   → condition true  → buttons PRESENT in client HTML
           *   → React hydration mismatch → full Navbar remount → visible vertical page shift on refresh
           *
           * Fix: always render both buttons. They already have their own skeleton states:
           *   - Bell:   disabled + text-transparent icon + animate-pulse overlay when !user
           *   - Avatar: disabled + animate-pulse grey circle when !user
           * Both server and client render the same DOM structure → zero mismatch.
           */}

          {/* Notification Bell — skeleton (disabled + pulse overlay) while user is null */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative rounded-full p-2 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                aria-label="Notifications"
                disabled={!user}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border ${unreadCount > 0
                    ? "border-red-200 bg-red-50/80 text-red-600"
                    : "border-sky-200/80 bg-sky-50/80 text-sky-600"
                    } ${!user ? "text-transparent border-transparent bg-transparent" : ""}`}
                >
                  <Bell className="h-3.5 w-3.5" />
                </span>
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
              <DropdownMenuContent
                align="end"
                className="w-80 max-h-96 overflow-y-auto px-2 py-2 [scrollbar-gutter:auto] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  {/*
                   * Header row — show both counts in a meaningful compact way:
                   * - Total notifications (all)
                   * - Unseen notifications (new)
                   * "Mark all read" stays aligned right on the same row.
                   */}
                  <div className="flex items-center justify-between gap-2 px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                        <BellRing className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="text-sm text-gray-700 font-semibold ">Notifications</span>
                      <Badge variant="outline" className="min-h-5 rounded-full px-1.5 text-[10px] font-semibold text-gray-600">
                        {total}
                      </Badge>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="min-h-5 rounded-full px-1.5 tabular-nums text-[10px] font-bold">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )}
                    </div>
                    {/* Keep Delete Read in the main header row when there are no unread notifications. */}
                    {unreadCount === 0 && readCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDeleteDialogOpen(true);
                        }}
                        className="flex cursor-pointer items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Delete Read
                      </button>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    /*
                     * Action row behavior:
                     * Keep actions visually stable: always render the row as justify-between.
                     * - unread + read exist: both active.
                     * - unread only: Delete Read remains visible but disabled.
                     * - read-only state keeps Delete Read in header row above
                     */
                    <div className="flex items-center justify-between px-2">
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAllAsRead(); }}
                        className="flex cursor-pointer items-center gap-1 text-xs text-gray-500 hover:text-sky-600 transition-colors"
                      >
                        <CheckCheck className="h-3 w-3" /> Mark All Read
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (readCount > 0) setIsDeleteDialogOpen(true);
                        }}
                        disabled={readCount === 0}
                        className="flex cursor-pointer items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-3 w-3" /> Delete Read
                      </button>
                    </div>
                  )}
                </DropdownMenuLabel>
                {/* Reuse the same shared confirmation dialog style as appointment delete actions. */}
                <ConfirmActionDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                  title="Delete all read notifications?"
                  subtitle="This removes only read notifications. Unread items remain in your inbox."
                  confirmLabel={isDeletingRead ? "Deleting..." : "Delete Read"}
                  variant="destructive"
                  disabled={isDeletingRead}
                  onConfirm={() => {
                    deleteRead();
                    setIsDeleteDialogOpen(false);
                  }}
                />
                {/* Inset divider to align with the popover's px-2 horizontal spacing */}
                <DropdownMenuSeparator className="mx-1" />
                {notifications.length === 0 ? (
                  <div className="space-y-2 px-2 py-2 text-left text-sm text-muted-foreground">
                    <p className="text-center font-medium text-foreground">No notifications yet</p>
                    <p className="text-xs ">
                      You will see updates here for in-app activity such as:
                    </p>
                    <ul className="list-disc pl-4 text-xs leading-relaxed">
                      <li>New patient bookings from the patient portal</li>
                      <li>Upcoming appointment reminders for you and accepted assignees</li>
                      <li>Other alerts created by your workspace or integrations</li>
                    </ul>
                    <p className="text-[11px] leading-relaxed text-muted-foreground/90">
                      Reminders follow your reminder schedule; new items also appear when this menu is open or on the next refresh (about every 30 seconds).
                    </p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => {
                    /*
                     * Resolve per-type visual config: icon, colors, badge label, unread dot.
                     * `getNotifConfig` returns a safe fallback for unknown types.
                     */
                    const cfg = getNotifConfig(n.type);
                    const NIcon = cfg.icon;
                    return (
                      <DropdownMenuItem
                        key={n.id}
                        className={`flex flex-col items-start rounded-xl px-2 py-2 cursor-pointer last:mb-0 ${!n.read ? "bg-primary/5" : ""}`}
                        onClick={() => {
                          /*
                           * Navigate to the notification's deep-link when available.
                           * If historical rows have null/empty link, use a meaningful
                           * section fallback so clicking still lands in related UI.
                           */
                          const targetLink =
                            n.link?.trim() ||
                            (n.type === "appointment_created" || n.type === "status_update" || n.type === "reminder" || n.type === "info"
                              ? "/control-panel/appointments"
                              : "/dashboard");
                          if (!n.read) markAsRead(n.id);
                          router.push(targetLink);
                        }}
                      >
                        {/* Row 1: type icon + title + glassmorphic badge + colored unread dot */}
                        <div className="flex items-center gap-2 w-full">
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${cfg.iconBg} ${cfg.iconBorder}`}>
                            <NIcon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
                          </span>
                          <span className="text-xs font-medium text-gray-700 truncate flex-1">{n.title}</span>
                          {/* Glassmorphic type badge — replaces raw schema string (e.g. "status_update") */}
                          <Badge className={`shrink-0 border px-1.5 py-0 h-5 text-[10px] font-medium leading-5 ${cfg.badgeClass}`}>
                            {cfg.label}
                          </Badge>
                          {/* Colored unread dot — hue matches the notification type */}
                          {!n.read && (
                            <span className={`h-2 w-2 rounded-full shrink-0 ${cfg.dotClass}`} />
                          )}
                        </div>
                        {/* Row 2: message body */}
                        <p className="pl-8 text-xs text-muted-foreground line-clamp-2 w-full">{n.message}</p>
                        {/* Row 3: relative timestamp */}
                        <span className="pl-8 text-[10px] text-muted-foreground/70">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            )}
          </DropdownMenu>

          {/* User Avatar Menu — skeleton (disabled + grey pulse circle) while user is null */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-10 w-10 overflow-hidden rounded-full bg-white ring-1 ring-slate-200 shadow-sm transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                aria-label="Account menu"
                disabled={!user}
              >
                {user ? (
                  // Shared avatar with safe-image fallback so profile photos stay resilient.
                  <UserAvatar
                    src={avatarSrc}
                    fallbackText={initials}
                    sizeClassName="h-10 w-10"
                  />
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
        </div>
      </div>
      <GlobalSearch />
    </div>
  );
}
