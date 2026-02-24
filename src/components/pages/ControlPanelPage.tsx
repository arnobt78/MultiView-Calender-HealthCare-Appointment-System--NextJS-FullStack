"use client";

import React, { useState } from "react";
import AppointmentAccessPermission from "@/components/control-panel/AppointmentAccessPermission";
import UserAccessPermission from "@/components/control-panel/UserAccessPermission";
import InvitationList from "@/components/control-panel/InvitationList";
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

export default function ControlPanelPage() {
  const [activeTab, setActiveTab] = useState("appointment");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
          <TabsList className="flex h-auto flex-col rounded-none border-0 bg-transparent p-2 gap-1 w-full">
            <TabsTrigger value="appointment" className="justify-start w-full">
              Appointment Access Invitation
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="justify-start w-full">
              User Dashboard Access Invitation
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </aside>

      {/* Mobile: Sheet for sidebar */}
      <div className="md:hidden flex items-center p-2 border-b bg-white">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Control Panel</SheetTitle>
            </SheetHeader>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSheetOpen(false); }} className="mt-4">
              <TabsList className="flex flex-col w-full">
                <TabsTrigger value="appointment" className="w-full justify-start">
                  Appointment Access Invitation
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="w-full justify-start">
                  User Dashboard Access Invitation
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="md:hidden mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointment">Appointment Access</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard Access</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="appointment" className="mt-4">
            <AppointmentAccessPermission />
            <InvitationList type="appointment" />
          </TabsContent>
          <TabsContent value="dashboard" className="mt-4">
            <UserAccessPermission />
            <InvitationList type="dashboard" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
