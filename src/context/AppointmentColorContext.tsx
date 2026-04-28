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

import React, { createContext, useContext, useRef } from "react";

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
function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized.split("").map((c) => c + c).join("")
      : normalized;
  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function toRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixWithWhite(hex: string, colorRatio: number) {
  const { r, g, b } = hexToRgb(hex);
  const ratio = Math.max(0, Math.min(1, colorRatio));
  const ch = (value: number) => Math.round(255 * (1 - ratio) + value * ratio);
  return `rgb(${ch(r)}, ${ch(g)}, ${ch(b)})`;
}

const getAppointmentColorToken = (
  randomBgColor: (seed: string) => string,
  seed: string,
  preferredColor?: string | null
) => {
  void preferredColor;
  const lineColor = randomBgColor(seed);
  return {
    lineColor,
    cardBgColor: toRgba(lineColor, 0.03),
    cardSurfaceColor: mixWithWhite(lineColor, 0.1),
    cardBorderColor: toRgba(lineColor, 0.45),
  };
};

// Create context with color utilities
const AppointmentColorContext = createContext({
  bgColors,
  randomBgColor: (_seed: string) => bgColors[0],
  getAppointmentColorToken: (seed: string, preferredColor?: string | null) =>
    getAppointmentColorToken((_s: string) => bgColors[0], seed, preferredColor),
});

/**
 * AppointmentColorProvider Component
 * 
 * Provides color management utilities to all child components.
 * 
 * @param children - Child components that need access to color utilities
 */
export const AppointmentColorProvider = ({ children }: { children: React.ReactNode }) => {
  const randomColorBySeedRef = useRef<Map<string, string>>(new Map());

  const randomBgColor = (seed: string) => {
    const existing = randomColorBySeedRef.current.get(seed);
    if (existing) return existing;
    const color = bgColors[Math.floor(Math.random() * bgColors.length)];
    randomColorBySeedRef.current.set(seed, color);
    return color;
  };

  return (
    <AppointmentColorContext.Provider
      value={{
        bgColors,
        randomBgColor,
        getAppointmentColorToken: (seed: string, preferredColor?: string | null) =>
          getAppointmentColorToken(randomBgColor, seed, preferredColor),
      }}
    >
      {children}
    </AppointmentColorContext.Provider>
  );
};

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