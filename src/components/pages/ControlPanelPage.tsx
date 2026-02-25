"use client";

import React, { useState } from "react";
import AppointmentAccessPermission from "@/components/control-panel/AppointmentAccessPermission";
import UserAccessPermission from "@/components/control-panel/UserAccessPermission";
import InvitationList from "@/components/control-panel/InvitationList";
import PatientManagement from "@/components/control-panel/PatientManagement";
import CategoryManagement from "@/components/control-panel/CategoryManagement";
import DoctorManagement from "@/components/control-panel/DoctorManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  { value: "appointment", label: "Appointment Access Invitation" },
  { value: "dashboard", label: "User Dashboard Access Invitation" },
  { value: "patients", label: "Patient Management" },
  { value: "categories", label: "Category Management" },
  { value: "doctors", label: "Doctor / User Management" },
] as const;

type ControlPanelPageProps = {
  /** Optional session from SSR to avoid client round-trip */
  initialSession?: { userId: string; email: string } | null;
};

export default function ControlPanelPage({ initialSession }: ControlPanelPageProps) {
  const [activeTab, setActiveTab] = useState("appointment");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 min-h-[60vh]">
        {/* Desktop sidebar - shadcn Tabs as vertical tab menu */}
        <aside className="hidden md:flex min-w-[240px] w-64 shrink-0 flex-col rounded-lg border bg-card text-card-foreground shadow-xl">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            orientation="vertical"
            className="flex-1 w-full"
          >
            <TabsList
              variant="line"
              className="flex h-auto flex-col rounded-none rounded-t-lg border-0 bg-transparent p-2 gap-0.5 w-full"
            >
              {SIDEBAR_ITEMS.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className={cn(
                    "w-full justify-start rounded-md px-3 py-2 text-base font-medium text-left whitespace-normal h-auto min-h-[2.5rem] cursor-pointer",
                    "hover:!bg-gray-100",
                    "data-[state=active]:!bg-gray-200 data-[state=active]:!text-foreground",
                    "data-[state=active]:after:!content-none data-[state=active]:after:!hidden"
                  )}
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </aside>

        {/* Mobile: Sheet for sidebar */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="default" className="rounded-md shadow-xl" aria-label="Open menu">
                <Menu className="h-5 w-5 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Control Panel</SheetTitle>
              </SheetHeader>
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v);
                  setSheetOpen(false);
                }}
                orientation="vertical"
                className="flex-1"
              >
                <TabsList className="flex flex-col h-auto rounded-none border-0 bg-transparent p-2 gap-0.5 w-full">
                  {SIDEBAR_ITEMS.map((item) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      className={cn(
                        "w-full justify-start rounded-md px-3 py-2 text-sm cursor-pointer",
                        "hover:!bg-gray-100",
                        "data-[state=active]:!bg-gray-200 data-[state=active]:!text-foreground"
                      )}
                    >
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content - dynamic width */}
        <main className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="md:hidden mb-4">
              <TabsList className="grid w-full grid-cols-2 rounded-md shadow-xl">
                <TabsTrigger value="appointment" className="py-2">Appointment Access</TabsTrigger>
                <TabsTrigger value="dashboard" className="py-2">Dashboard Access</TabsTrigger>
                <TabsTrigger value="patients" className="py-2">Patients</TabsTrigger>
                <TabsTrigger value="categories" className="py-2">Categories</TabsTrigger>
                <TabsTrigger value="doctors" className="py-2">Doctors</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="appointment" className="mt-0 md:mt-0">
              <AppointmentAccessPermission />
              <InvitationList type="appointment" />
            </TabsContent>
            <TabsContent value="dashboard" className="mt-0 md:mt-0">
              <UserAccessPermission />
              <InvitationList type="dashboard" />
            </TabsContent>
            <TabsContent value="patients" className="mt-0 md:mt-0">
              <PatientManagement />
            </TabsContent>
            <TabsContent value="categories" className="mt-0 md:mt-0">
              <CategoryManagement />
            </TabsContent>
            <TabsContent value="doctors" className="mt-0 md:mt-0">
              <DoctorManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
