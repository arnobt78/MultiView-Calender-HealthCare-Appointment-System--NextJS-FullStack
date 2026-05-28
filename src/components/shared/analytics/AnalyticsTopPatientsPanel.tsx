"use client";

import { Inbox } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsChartEmptyStateCopy } from "@/components/shared/analytics/AnalyticsChartEmptyStateCopy";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import { getPatientCareLevelLabel } from "@/lib/patient-care-level";
import { patientDetailHref, type EntityRole } from "@/lib/entity-routes";
import { insightsChartBodyMinHeightClass } from "@/lib/insights-ui-classes";
import {
  clinicalCellMutedTextClass,
  clinicalCellPrimaryTextClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

export type TopPatientRow = {
  id: string;
  name: string;
  firstname: string;
  lastname: string;
  email: string | null;
  birth_date: string | null;
  care_level: number | null;
  clinical_profile?: { image_url?: string } | null;
  count: number;
};

type Props = {
  patients: TopPatientRow[];
  viewerRole?: EntityRole;
  loading?: boolean;
};

/**
 * Top patients table — hides column headers when empty; empty body matches chart plot height.
 */
export function AnalyticsTopPatientsPanel({
  patients,
  viewerRole = "admin",
  loading = false,
}: Props) {
  const empty = !loading && patients.length === 0;

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Care Tier</TableHead>
            <TableHead className="text-right">Visits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-5 w-12" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (empty) {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 px-3 text-muted-foreground sm:px-4",
          insightsChartBodyMinHeightClass
        )}
        role="status"
        aria-live="polite"
      >
        <Inbox className="h-8 w-8 shrink-0 text-muted-foreground/60" aria-hidden />
        <AnalyticsChartEmptyStateCopy
          title="No patient visits in this period"
          description="Top patients will rank here when appointments are recorded in the selected range."
        />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Care Tier</TableHead>
          <TableHead className="text-right">Visits</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((p, idx) => (
          <TableRow key={`${p.id}-${idx}`}>
            <TableCell>
              <PatientIdentityCell
                name={p.name}
                email={p.email}
                href={patientDetailHref(viewerRole, p.id)}
                patient={{
                  id: p.id,
                  email: p.email,
                  clinical_profile: p.clinical_profile ?? null,
                  birth_date: p.birth_date,
                  firstname: p.firstname,
                  lastname: p.lastname,
                }}
              />
            </TableCell>
            <TableCell>
              <span className={clinicalCellPrimaryTextClass}>
                {getPatientCareLevelLabel(p.care_level)}
              </span>
            </TableCell>
            <TableCell className={cn("text-right tabular-nums", clinicalCellMutedTextClass)}>
              {p.count}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
