/**
 * AppointmentColorContext - Color Management for Appointments
 * 
 * This context provides a deterministic color assignment system for appointments.
 * Instead of random colors, it uses a seed-based algorithm to ensure the same
 * appointment/category always gets the same color, improving visual consistency.
 * 
 * Key Features:
 * - Deterministic: Same input always produces same color
 * - Consistent: Colors persist across page refreshes
 * - Visual distinction: Helps users quickly identify appointment types/categories
 */

import React, { createContext, useContext } from "react";

// Predefined color palette for appointments
// These colors are chosen for good contrast and visual distinction
const bgColors = [
  "#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#EF4444",
  "#14B8A6", "#6366F1", "#F97316", "#A78BFA", "#22D3EE",
  "#00FF00", "#FFFF00", "#00FFFF", "#FF00FF",
];

/**
 * randomBgColor Function
 * 
 * Generates a deterministic color based on a seed string.
 * Uses a hash-like algorithm to convert the seed into an array index.
 * 
 * Algorithm:
 * 1. Split seed string into characters
 * 2. Sum all character codes
 * 3. Use modulo to get index within bgColors array
 * 
 * Example:
 * randomBgColor("appointment-123") always returns the same color
 * 
 * @param seed - String used to deterministically select a color (e.g., appointment ID, category name)
 * @returns Hex color code from bgColors array
 */
const randomBgColor = (seed: string) =>
  bgColors[
    seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % bgColors.length
  ];

// Create context with color utilities
const AppointmentColorContext = createContext({
  bgColors,
  randomBgColor,
});

/**
 * AppointmentColorProvider Component
 * 
 * Provides color management utilities to all child components.
 * 
 * @param children - Child components that need access to color utilities
 */
export const AppointmentColorProvider = ({ children }: { children: React.ReactNode }) => (
  <AppointmentColorContext.Provider value={{ bgColors, randomBgColor }}>
    {children}
  </AppointmentColorContext.Provider>
);

/**
 * useAppointmentColor Hook
 * 
 * Custom hook to access appointment color utilities.
 * 
 * Usage:
 * const { randomBgColor, bgColors } = useAppointmentColor();
 * const color = randomBgColor(appointment.category || appointment.id);
 * 
 * @returns Object with bgColors array and randomBgColor function
 */
export const useAppointmentColor = () => useContext(AppointmentColorContext);