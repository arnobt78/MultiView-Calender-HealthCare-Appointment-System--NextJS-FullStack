"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/notify";
import { invalidateAfterAppointmentMutation } from "@/lib/query-client";
import { appointmentIcsImportSchema } from "@/lib/schemas/appointment";
import { maxUploadSizeBytes } from "@/lib/schemas/upload";
import { CalendarDays, FileUp, Info, UploadCloud, X } from "lucide-react";

type Props = {
  trigger?: React.ReactNode;
};

export default function ImportICSDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && !selected.name.endsWith(".ics")) {
      notify.error({
        title: "Invalid file type",
        subtitle: "Please choose a valid .ics file.",
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (selected && selected.size > maxUploadSizeBytes) {
      notify.error({
        title: "File too large",
        subtitle: "Maximum upload size is 1 MB.",
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(selected);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const content = await file.text();
      const parsed = appointmentIcsImportSchema.safeParse({ content });
      if (!parsed.success) {
        notify.error({
          title: "Import validation failed",
          subtitle: parsed.error.issues[0]?.message || "Invalid .ics file content.",
        });
        return;
      }

      const res = await fetch("/api/appointments/import-ics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();

      if (!res.ok) {
        notify.error({
          title: "Import failed",
          subtitle: data.error ?? "Unable to import appointments from this file.",
        });
        return;
      }

      notify.crud({
        action: "imported",
        entity: "Appointments",
        detail: data.message ?? "Appointments were imported successfully.",
      });
      await invalidateAfterAppointmentMutation(queryClient);
      setOpen(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      notify.error({
        title: "Upload failed",
        subtitle: "Failed to read or upload the file.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="cursor-pointer shadow-xl">
            Import .ics
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="flex h-auto min-h-0 max-h-[90vh] w-[92vw] max-w-xl flex-col gap-0 overflow-x-hidden overflow-y-auto rounded-[28px] border border-violet-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(139,92,246,0.35)]"
      >
        <DialogHeader className="space-y-0 p-0 text-left">
          <div className="bg-white pt-6">
            <div className="px-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-200/70 bg-violet-50 text-violet-700">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="text-xl font-semibold text-gray-700">
                      Import .ics Calendar
                    </DialogTitle>
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                      File Upload
                    </kbd>
                  </div>
                  <DialogDescription className="text-sm">
                    Upload an iCalendar file from Google, Outlook or Apple Calendar
                    to create appointments instantly.
                  </DialogDescription>
                </div>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8 rounded-full text-muted-foreground hover:bg-violet-100 hover:text-violet-700"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogClose>
              </div>
            </div>
            <div className="mx-6 mt-4 border-b border-violet-200/60" />
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-2xl border border-violet-200/70 bg-violet-50/60 p-3 text-xs text-violet-900 shadow-[0_8px_24px_rgba(139,92,246,0.12)]">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
              <p className="leading-relaxed">
                Choose a <strong>.ics</strong> file. Imported events are added as new
                appointments in your calendar.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ics-file-input" className="text-sm font-medium text-gray-700">
              Select .ics file
            </Label>
            <div className="rounded-2xl border border-violet-200/70 bg-white p-2 shadow-[0_10px_28px_rgba(139,92,246,0.12)]">
              <input
                id="ics-file-input"
                ref={fileInputRef}
                type="file"
                accept=".ics,text/calendar"
                title="Select a .ics calendar file to import"
                onChange={handleFileChange}
                className="block w-full cursor-pointer rounded-2xl border-0 bg-transparent p-1 text-sm text-gray-700 file:mr-3 file:cursor-pointer file:rounded-2xl file:border file:border-violet-300/60 file:bg-violet-100/70 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-violet-800 hover:file:bg-violet-200/70"
              />
            </div>
          </div>

          {file ? (
            <div className="rounded-2xl border border-emerald-300/50 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900 shadow-[0_8px_24px_rgba(16,185,129,0.12)]">
              <div className="flex items-center gap-2">
                <FileUp className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                <span className="truncate font-medium">{file.name}</span>
                <span className="text-emerald-700/80">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 px-3 py-2 text-xs text-muted-foreground">
              No file selected yet.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="rounded-full border-violet-200/70 bg-white text-violet-700 shadow-[0_8px_20px_rgba(139,92,246,0.1)] hover:bg-violet-50 hover:text-violet-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || loading}
              className="rounded-full border border-violet-500/40 bg-linear-to-r from-violet-600 to-violet-700 text-white shadow-[0_12px_34px_rgba(139,92,246,0.36)] hover:from-violet-600/95 hover:to-violet-700/95"
            >
              <UploadCloud className="h-4 w-4" />
              {loading ? "Importing..." : "Import Appointments"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
