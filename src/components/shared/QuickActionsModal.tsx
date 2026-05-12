"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import {
  Plus,
  User,
  CalendarDays,
  LayoutDashboard,
  Activity,
  Search,
  Settings,
  FileText,
  Stethoscope,
  CreditCard,
  X,
} from "lucide-react";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  href?: string;
  action?: () => void;
  color: string;
}

export default function QuickActionsModal() {
  const isOpen = useAppStore((s) => s.isQuickActionModalOpen);
  const toggleQuickActionModal = useAppStore((s) => s.toggleQuickActionModal);
  const openSearch = useAppStore((s) => s.openSearch);
  const router = useRouter();

  const handleAction = (item: QuickAction) => {
    toggleQuickActionModal();
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  // Keyboard shortcut ⌘J to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        useAppStore.getState().toggleQuickActionModal();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const ACTIONS: QuickAction[] = [
    {
      icon: CalendarDays,
      label: "Calendar View",
      description: "Open the main scheduling board with day, week, month and list views.",
      href: "/dashboard?view=list",
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: Plus,
      label: "New Appointment",
      description: "Jump to calendar and start creating a new appointment instantly.",
      href: "/dashboard?view=list&compose=1",
      color: "bg-green-100 text-green-700",
    },
    {
      icon: User,
      label: "Patient Management",
      description: "Review patient profiles, contact details and appointment history.",
      href: "/control-panel/patient-management",
      color: "bg-teal-100 text-teal-700",
    },
    {
      icon: Stethoscope,
      label: "Doctor Management",
      description: "Doctor accounts (role doctor). Use Staff tab for admin users.",
      href: "/control-panel/doctor-management",
      color: "bg-purple-100 text-purple-700",
    },
    {
      icon: LayoutDashboard,
      label: "Control Panel",
      description: "Access full system configuration and operations in one place.",
      href: "/control-panel/dashboard-overview",
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      icon: Activity,
      label: "Insights",
      description: "Track appointment trends and performance insights quickly.",
      href: "/insights",
      color: "bg-orange-100 text-orange-700",
    },
    {
      icon: FileText,
      label: "Patient Portal",
      description: "Open patient-facing flows and self-service interactions.",
      href: "/patient-portal",
      color: "bg-pink-100 text-pink-700",
    },
    {
      icon: CreditCard,
      label: "Invoices & Payments",
      description: "Handle invoices, billing records and payment workflows.",
      href: "/control-panel/invoice-management",
      color: "bg-amber-100 text-amber-700",
    },
    {
      icon: Search,
      label: "Global Search",
      description: "Find appointments, patients and records across the app.",
      action: openSearch,
      color: "bg-gray-100 text-gray-700",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Configure integrations, sync preferences and system settings.",
      href: "/control-panel/google-calendar",
      color: "bg-slate-100 text-gray-700",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleQuickActionModal()}>
      <DialogContent
        showCloseButton={false}
        className="h-[90vh] w-[92vw] max-w-[1200px] gap-0 overflow-hidden rounded-[28px] border border-violet-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(139,92,246,0.35)]"
        aria-describedby={undefined}
      >
        <div className=" bg-white pt-6 px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-200/70 bg-violet-50 text-violet-700">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl font-semibold text-gray-700">
                  Quick Actions
                </DialogTitle>
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                  ⌘J
                </kbd>
              </div>
              <DialogDescription className="text-sm">
                Jump to key areas quickly. Select an action card below to navigate instantly and keep your workflow moving.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto h-8 w-8 rounded-full text-muted-foreground hover:bg-violet-100 hover:text-violet-700"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
          <div className="pt-4 border-b border-violet-200/60" />
        </div>
        <div className="grid h-[calc(90vh-112px)] grid-cols-1 gap-3 overflow-y-auto px-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((item) => (
            <Button
              key={item.label}
              variant="outline"
              className="h-auto min-h-[96px] justify-start gap-3 overflow-hidden whitespace-normal rounded-2xl border-violet-200/60 bg-white p-4 text-left shadow-[0_10px_30px_rgba(139,92,246,0.15)] transition-all hover:border-violet-300/70 hover:shadow-[0_14px_34px_rgba(139,92,246,0.22)]"
              onClick={() => handleAction(item)}
            >
              <span className={`rounded-full p-2 shrink-0 ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium leading-tight">{item.label}</p>
                <p className="mt-0.5 break-words text-xs leading-tight text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
