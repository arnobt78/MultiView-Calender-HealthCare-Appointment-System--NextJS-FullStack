import { AlertCircle } from "lucide-react";
import { appSectionErrorBannerClass } from "@/lib/section-page-layout";
import { cn } from "@/lib/utils";

type AppSectionErrorBannerProps = {
  children: React.ReactNode;
  className?: string;
};

/** Inline section fetch failure — shared CP tabs, portals, and detail views. */
export function AppSectionErrorBanner({ children, className }: AppSectionErrorBannerProps) {
  return (
    <div className={cn(appSectionErrorBannerClass, className)} role="alert">
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
      {children}
    </div>
  );
}
