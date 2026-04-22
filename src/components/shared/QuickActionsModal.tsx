"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
      description: "Go to the main calendar",
      href: "/",
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: Plus,
      label: "New Appointment",
      description: "Open the calendar & create appointment",
      href: "/",
      color: "bg-green-100 text-green-700",
    },
    {
      icon: User,
      label: "Patient Management",
      description: "Manage all patients",
      href: "/control-panel",
      color: "bg-teal-100 text-teal-700",
    },
    {
      icon: Stethoscope,
      label: "Doctor Management",
      description: "Manage doctors & staff",
      href: "/control-panel",
      color: "bg-purple-100 text-purple-700",
    },
    {
      icon: LayoutDashboard,
      label: "Control Panel",
      description: "All system management",
      href: "/control-panel",
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      icon: Activity,
      label: "Insights",
      description: "Appointment statistics",
      href: "/insights",
      color: "bg-orange-100 text-orange-700",
    },
    {
      icon: FileText,
      label: "Patient Portal",
      description: "Patient self-service portal",
      href: "/patient-portal",
      color: "bg-pink-100 text-pink-700",
    },
    {
      icon: CreditCard,
      label: "Invoices & Payments",
      description: "Billing management",
      href: "/control-panel",
      color: "bg-amber-100 text-amber-700",
    },
    {
      icon: Search,
      label: "Global Search",
      description: "Search entities (⌘K)",
      action: openSearch,
      color: "bg-gray-100 text-gray-700",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Google Calendar & system settings",
      href: "/control-panel",
      color: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleQuickActionModal()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="px-5 pt-5 pb-3 text-lg font-semibold flex items-center gap-2">
          Quick Actions
          <kbd className="ml-auto text-xs font-mono px-1.5 py-0.5 bg-muted border rounded text-muted-foreground">⌘J</kbd>
        </DialogTitle>
        <div className="grid grid-cols-2 gap-2 px-4 pb-5">
          {ACTIONS.map((item) => (
            <Button
              key={item.label}
              variant="outline"
              className="h-auto flex items-start gap-3 p-3 text-left justify-start hover:shadow-sm transition-shadow"
              onClick={() => handleAction(item)}
            >
              <span className={`rounded-full p-2 shrink-0 ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{item.label}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-1">{item.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
