"use client";

/**
 * DateContext - Global Date State Management
 * 
 * This context provides global state management for the current date being viewed
 * in the calendar. This allows all calendar components (MonthView, WeekView, ListView)
 * to stay synchronized when the user navigates between dates.
 * 
 * Benefits:
 * - Centralized date state prevents prop drilling
 * - All calendar views automatically update when date changes
 * - Easy navigation between months/weeks from any component
 */

import { createContext, useContext, useState } from "react";

// Define the shape of the context value
// currentDate: The currently selected/viewing date
// setCurrentDate: Function to update the current date
const DateContext = createContext<{
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
} | null>(null);

/**
 * DateProvider Component
 * 
 * Wraps the application (or calendar section) to provide date context.
 * Initializes with today's date as the default.
 * 
 * @param children - Child components that need access to date context
 */
export function DateProvider({ children }: { children: React.ReactNode }) {
  // State to track the current date being viewed in the calendar
  // Initialized to current date (today)
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <DateContext.Provider value={{ currentDate, setCurrentDate }}>
      {children}
    </DateContext.Provider>
  );
}

/**
 * useDateContext Hook
 * 
 * Custom hook to access the DateContext from any component.
 * Provides type-safe access to currentDate and setCurrentDate.
 * 
 * Usage:
 * const { currentDate, setCurrentDate } = useDateContext();
 * 
 * @throws Error if used outside of DateProvider
 * @returns Object with currentDate and setCurrentDate
 */
export function useDateContext() {
  const context = useContext(DateContext);
  // Safety check: Ensure hook is used within DateProvider
  if (!context) throw new Error("DateContext not found");
  return context;
}
