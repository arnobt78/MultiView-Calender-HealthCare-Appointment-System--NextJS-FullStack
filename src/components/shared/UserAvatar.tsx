"use client";

import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/safe-image";

type UserAvatarProps = {
  src?: string | null;
  alt?: string;
  fallbackText: string;
  sizeClassName?: string;
  className?: string;
  loading?: boolean;
};

export function UserAvatar({
  src,
  alt = "",
  fallbackText,
  sizeClassName = "h-9 w-9",
  className,
  loading = false,
}: UserAvatarProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-full bg-gray-200/90 animate-pulse ring-1 ring-slate-200/80",
          sizeClassName,
          className
        )}
      />
    );
  }

  const displayFallback = (fallbackText || "?").slice(0, 2).toUpperCase();
  const hasSrc = Boolean(src);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-white ring-1 ring-slate-200/80 shrink-0",
        sizeClassName,
        className
      )}
    >
      {hasSrc ? (
        <SafeImage
          src={src as string}
          alt={alt}
          fill
          sizes="40px"
          className="object-cover object-center"
          referrerPolicy="no-referrer"
        />
      ) : null}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-primary/10 text-gray-700 font-medium text-xs",
          hasSrc ? "opacity-0" : "opacity-100"
        )}
        aria-hidden={hasSrc}
      >
        {displayFallback}
      </div>
    </div>
  );
}
