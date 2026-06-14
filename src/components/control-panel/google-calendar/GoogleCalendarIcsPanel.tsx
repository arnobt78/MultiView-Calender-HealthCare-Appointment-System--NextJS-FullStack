"use client";

import { useRef } from "react";
import Link from "next/link";
import { Download, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import {
  googleCalendarIcsCopy,
  googleCalendarPanelCardClass,
  googleCalendarPanelCardContentClass,
} from "@/lib/google-calendar-ui-classes";
import { violetGlassImportButtonClass } from "@/lib/calendar-header-action-styles";
import { cn } from "@/lib/utils";

type Props = {
  exportUrl: string;
  isImporting: boolean;
  onImportFile: (file: File) => void;
};

/** Emerald + indigo glass — quick ICS import/export cards. */
export function GoogleCalendarIcsPanel({ exportUrl, isImporting, onImportFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onImportFile(file);
    if (e.target) e.target.value = "";
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className={cn(googleCalendarPanelCardClass("emerald"), "gap-0")}>
        <CardContent className={googleCalendarPanelCardContentClass}>
          <PortalPanelSubsectionHeader
            title={googleCalendarIcsCopy.importTitle}
            subtitle={googleCalendarIcsCopy.importSubtitle}
            icon={Upload}
            iconClassName="border-emerald-100 bg-emerald-50 [&_svg]:text-emerald-600"
          />
          <input
            ref={fileInputRef}
            id="gcal-ics-import-file"
            type="file"
            accept=".ics"
            aria-label="Select .ics calendar file to import"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="mt-4">
            <ControlPanelGlassActionButton
              variant="emerald"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" aria-hidden />
              {isImporting ? "Importing…" : googleCalendarIcsCopy.chooseFileButton}
            </ControlPanelGlassActionButton>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(googleCalendarPanelCardClass("indigo"), "gap-0")}>
        <CardContent className={googleCalendarPanelCardContentClass}>
          <PortalPanelSubsectionHeader
            title={googleCalendarIcsCopy.exportTitle}
            subtitle={googleCalendarIcsCopy.exportSubtitle}
            icon={Download}
            iconClassName="border-indigo-100 bg-indigo-50 [&_svg]:text-indigo-600"
          />
          <div className="mt-4">
            <Link
              href={exportUrl}
              download="healthcalpro-appointments.ics"
              className={cn(violetGlassImportButtonClass, "inline-flex items-center gap-2 no-underline")}
            >
              <Download className="h-4 w-4" aria-hidden />
              {googleCalendarIcsCopy.downloadButton}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
