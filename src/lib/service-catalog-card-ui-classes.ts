import type { ServiceCatalogGlowVariant } from "@/lib/service-catalog-visual";
import { cn } from "@/lib/utils";

/** Base frame — hover lift pairs with per-variant glow shadow. */
export const serviceCatalogCardFrameClass =
  "rounded-[16px] border bg-card transition-all duration-300 hover:-translate-y-0.5";

/** Per-hue glass glow shadows for service catalog tiles. */
export const SERVICE_CATALOG_CARD_GLOW_CLASS: Record<ServiceCatalogGlowVariant, string> = {
  sky: "border-sky-200/45 shadow-[0_4px_22px_rgba(14,165,233,0.16)] hover:shadow-[0_12px_36px_rgba(14,165,233,0.26)]",
  violet:
    "border-violet-200/45 shadow-[0_4px_22px_rgba(139,92,246,0.16)] hover:shadow-[0_12px_36px_rgba(139,92,246,0.26)]",
  emerald:
    "border-emerald-200/45 shadow-[0_4px_22px_rgba(16,185,129,0.16)] hover:shadow-[0_12px_36px_rgba(16,185,129,0.26)]",
  amber:
    "border-amber-200/45 shadow-[0_4px_22px_rgba(245,158,11,0.16)] hover:shadow-[0_12px_36px_rgba(245,158,11,0.26)]",
  rose: "border-rose-200/45 shadow-[0_4px_22px_rgba(244,63,94,0.14)] hover:shadow-[0_12px_36px_rgba(244,63,94,0.24)]",
  teal: "border-teal-200/45 shadow-[0_4px_22px_rgba(20,184,166,0.16)] hover:shadow-[0_12px_36px_rgba(20,184,166,0.26)]",
  indigo:
    "border-indigo-200/45 shadow-[0_4px_22px_rgba(99,102,241,0.16)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.26)]",
  slate:
    "border-slate-200/50 shadow-[0_4px_20px_rgba(100,116,139,0.14)] hover:shadow-[0_12px_32px_rgba(100,116,139,0.22)]",
};

export function serviceCatalogCardClass(variant: ServiceCatalogGlowVariant): string {
  return cn(serviceCatalogCardFrameClass, SERVICE_CATALOG_CARD_GLOW_CLASS[variant]);
}
