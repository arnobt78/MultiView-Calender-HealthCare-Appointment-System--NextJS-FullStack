"use client";

import { QueryProvider } from "./QueryProvider";
import { DateProvider } from "@/context/DateContext";
import { AppointmentColorProvider } from "@/context/AppointmentColorContext";
import { ToastProvider } from "./ToastProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * AppProviders composes all global providers for the application.
 * This keeps the layout file clean and ensures providers are instantiated in the correct order.
 * 
 * Hierarchy:
 * 1. QueryProvider (Data layer)
 * 2. ToastProvider (Notifications)
 * 3. Feature Contexts (Date, Color)
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <DateProvider>
        <AppointmentColorProvider>
          <TooltipProvider>
            {children}
            {/* ToastProvider is rendered here so it sits at the top level visually 
                but has access to any contexts if ever needed */}
            <ToastProvider />
          </TooltipProvider>
        </AppointmentColorProvider>
      </DateProvider>
    </QueryProvider>
  );
}
