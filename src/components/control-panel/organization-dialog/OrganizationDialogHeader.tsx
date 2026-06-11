"use client";

import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { organizationDialogHeaderIconTileClass } from "@/lib/organization-dialog-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/** White header + DialogClose — patient/appointment dialog parity (indigo tokens). */
export function OrganizationDialogHeader({ icon: Icon, title, description }: Props) {
  return (
    <div className="shrink-0 bg-white pt-6 text-gray-700">
      <div className="px-6">
        <div className="flex items-start gap-2">
          <span className={organizationDialogHeaderIconTileClass} aria-hidden>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-left text-lg font-semibold text-gray-900">
              {title}
            </DialogTitle>
            <DialogDescription className="text-left text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "ml-auto h-8 w-8 shrink-0 rounded-full text-muted-foreground",
                "hover:bg-indigo-100 hover:text-indigo-800"
              )}
            >
              <X className="h-4 w-4" aria-hidden />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>
      </div>
      <div className="mx-6 mt-4 border-b border-indigo-200/60" />
    </div>
  );
}
