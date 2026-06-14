"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { GoogleCalendarAdvancedImportDialog } from "@/components/control-panel/google-calendar/GoogleCalendarAdvancedImportDialog";
import {
  googleCalendarIcsCopy,
  googleCalendarPanelCardClass,
  googleCalendarPanelCardContentClass,
} from "@/lib/google-calendar-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  isImporting: boolean;
  onImport: (file: File, treatingPhysicianId: string) => void;
};

/** Amber glass — optional advanced import with treating physician assignment. */
export function GoogleCalendarAdvancedImportCard({ isImporting, onImport }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className={cn(googleCalendarPanelCardClass("amber"), "gap-0")}>
        <CardContent className={googleCalendarPanelCardContentClass}>
          <PortalPanelSubsectionHeader
            title={googleCalendarIcsCopy.advancedImportTitle}
            subtitle={googleCalendarIcsCopy.advancedImportSubtitle}
            icon={FileUp}
            iconClassName="border-amber-100 bg-amber-50 [&_svg]:text-amber-700"
          />
          <div className="mt-4">
            <ControlPanelGlassActionButton
              variant="emerald"
              disabled={isImporting}
              onClick={() => setDialogOpen(true)}
            >
              <FileUp className="h-4 w-4" aria-hidden />
              {googleCalendarIcsCopy.advancedImportOpenButton}
            </ControlPanelGlassActionButton>
          </div>
        </CardContent>
      </Card>
      <GoogleCalendarAdvancedImportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isImporting={isImporting}
        onImport={onImport}
      />
    </>
  );
}
