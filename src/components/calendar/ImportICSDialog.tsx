"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAppointments } from "@/hooks/useAppointments";
import { toast } from "sonner";

type Props = {
  trigger?: React.ReactNode;
};

export default function ImportICSDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refetch } = useAppointments();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && !selected.name.endsWith(".ics")) {
      toast.error("Please select a valid .ics file.");
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
      const res = await fetch("/api/appointments/import-ics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Import failed.");
        return;
      }

      toast.success(data.message ?? "Import successful.");
      refetch();
      setOpen(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Failed to read or upload the file.");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import from .ics Calendar File</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-gray-500">
            Select a <strong>.ics</strong> file exported from Google Calendar,
            Outlook, Apple Calendar, or any iCalendar-compatible app. All events
            will be imported as new appointments.
          </p>

          <div className="space-y-2">
            <Label htmlFor="ics-file-input">Select .ics file</Label>
            <input
              id="ics-file-input"
              ref={fileInputRef}
              type="file"
              accept=".ics,text/calendar"
              title="Select a .ics calendar file to import"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer border border-gray-200 rounded-md p-1"
            />
          </div>

          {file && (
            <p className="text-xs text-gray-500">
              Selected: <span className="font-medium text-gray-700">{file.name}</span>{" "}
              ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="cursor-pointer"
            >
              {loading ? "Importing…" : "Import Appointments"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
