/**
 * AppointmentColorContext - Color Management for Appointments
 *
 * Deterministic seed → color mapping so SSR and client hydration produce identical
 * inline styles (no Math.random — that caused Patient Portal timeline mismatches).
 */

import React, { createContext, useContext, useRef } from "react";

const bgColors = [
  "#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#EF4444",
  "#14B8A6", "#6366F1", "#F97316", "#A78BFA", "#22D3EE",
  "#00FF00", "#FFFF00", "#00FFFF", "#FF00FF",
];

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

/** Stable palette pick from seed string — identical on server and client. */
export function colorFromSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return bgColors[Math.abs(hash) % bgColors.length] ?? bgColors[0];
}

function normalizeHexColor(hex: string | null | undefined): string | null {
  if (!hex?.trim()) return null;
  const t = hex.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const body = t.slice(1);
    return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`;
  }
  return null;
}

/** Category hex from API when present; otherwise deterministic seed color. */
export function resolveAppointmentLineColor(
  seed: string,
  preferredColor?: string | null
): string {
  return normalizeHexColor(preferredColor) ?? colorFromSeed(seed);
}

function buildColorToken(lineColor: string) {
  return {
    lineColor,
    cardBgColor: toRgba(lineColor, 0.03),
    cardSurfaceColor: mixWithWhite(lineColor, 0.1),
    cardBorderColor: toRgba(lineColor, 0.45),
  };
}

const AppointmentColorContext = createContext({
  bgColors,
  randomBgColor: (seed: string) => colorFromSeed(seed),
  getAppointmentColorToken: (seed: string, preferredColor?: string | null) =>
    buildColorToken(resolveAppointmentLineColor(seed, preferredColor)),
});

export const AppointmentColorProvider = ({ children }: { children: React.ReactNode }) => {
  const colorBySeedRef = useRef<Map<string, string>>(new Map());

  const randomBgColor = (seed: string) => {
    const cached = colorBySeedRef.current.get(seed);
    if (cached) return cached;
    const color = colorFromSeed(seed);
    colorBySeedRef.current.set(seed, color);
    return color;
  };

  return (
    <AppointmentColorContext.Provider
      value={{
        bgColors,
        randomBgColor,
        getAppointmentColorToken: (seed: string, preferredColor?: string | null) =>
          buildColorToken(resolveAppointmentLineColor(seed, preferredColor)),
      }}
    >
      {children}
    </AppointmentColorContext.Provider>
  );
};

export const useAppointmentColor = () => useContext(AppointmentColorContext);
