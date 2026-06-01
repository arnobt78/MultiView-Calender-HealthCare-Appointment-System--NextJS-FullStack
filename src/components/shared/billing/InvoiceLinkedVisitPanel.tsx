"use client";

import Link from "next/link";
import { Calendar, MapPin, Stethoscope, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvoiceVisitSummary } from "@/lib/billing-types";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";

type Props = {
  summary: InvoiceVisitSummary;
  appointmentHref: string | null;
};

function DefinitionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[8rem_1fr] sm:gap-2">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

/** Human-readable visit context on invoice detail (replaces raw appointment_id only). */
export function InvoiceLinkedVisitPanel({ summary, appointmentHref }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          Linked visit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          <DefinitionRow label="Visit">
            {appointmentHref ? (
              <Link href={appointmentHref} className="font-medium hover:underline">
                {summary.title}
              </Link>
            ) : (
              summary.title
            )}
          </DefinitionRow>
          <DefinitionRow label="When">{summary.when_label}</DefinitionRow>
          <DefinitionRow label="Patient">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {summary.patient_label ?? "—"}
            </span>
          </DefinitionRow>
          <DefinitionRow label="Treating physician">
            <span className="inline-flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                {summary.treating_physician_label ?? "—"}
              </span>
              {summary.treating_physician_specialty && (
                <span className="text-xs text-muted-foreground">
                  {summary.treating_physician_specialty}
                </span>
              )}
            </span>
          </DefinitionRow>
          <DefinitionRow label="Calendar owner">
            <span className="inline-flex flex-col gap-0.5">
              {summary.calendar_owner_label ?? "—"}
              {summary.calendar_owner_specialty && (
                <span className="text-xs text-muted-foreground">
                  {summary.calendar_owner_specialty}
                </span>
              )}
            </span>
          </DefinitionRow>
          {summary.category_label && (
            <DefinitionRow label="Category">
              <span className="inline-flex items-center gap-2">
                <CategoryBrandMark color={summary.category_color} size="compact" />
                {summary.category_label}
              </span>
            </DefinitionRow>
          )}
          <DefinitionRow label="Location">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {summary.location_label}
            </span>
          </DefinitionRow>
        </dl>
      </CardContent>
    </Card>
  );
}
