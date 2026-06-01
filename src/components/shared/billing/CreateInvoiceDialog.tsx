"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InvoiceAppointmentPickerField } from "@/components/shared/billing/InvoiceAppointmentPickerField";

type CreateBody = {
  amount: number;
  description?: string;
  due_date?: string;
  appointment_id: string;
};

type Props = {
  variant: "admin" | "doctor";
  onCreate: (body: CreateBody) => void;
  appointmentId?: string;
  triggerLabel?: string;
};

export function CreateInvoiceDialog({
  variant,
  onCreate,
  appointmentId,
  triggerLabel = "New Invoice",
}: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [apptId, setApptId] = useState(appointmentId ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    const linkedAppt = (apptId.trim() || appointmentId || "").trim();
    if (!linkedAppt) return;

    onCreate({
      amount: parsed,
      description: description || undefined,
      due_date: dueDate || undefined,
      appointment_id: linkedAppt,
    });
    setAmount("");
    setDescription("");
    setDueDate("");
    if (!appointmentId) setApptId("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            {variant === "admin"
              ? "Link a visit so the patient sees this invoice on their portal."
              : "Draft invoice for one of your visits (visit link required)."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="inv-amount">Amount (EUR)</Label>
            <Input
              id="inv-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 150.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          {!appointmentId && (
            <InvoiceAppointmentPickerField
              value={apptId}
              onChange={setApptId}
              required
            />
          )}
          <div className="space-y-1.5">
            <Label htmlFor="inv-desc">Description</Label>
            <Textarea
              id="inv-desc"
              placeholder="Visit invoice"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-due">Due date</Label>
            <Input
              id="inv-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Create draft
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
