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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  analyticsChartEmptyDescriptionClass,
  analyticsChartEmptyTitleClass,
} from "@/lib/analytics-chart-interaction";
import { insightsChartBodyMinHeightClass } from "@/lib/insights-ui-classes";
import { cn } from "@/lib/utils";

export type TopPatientRow = { name: string; count: number };

type Props = {
  patients: TopPatientRow[];
  loading?: boolean;
};

/**
 * Top patients table — hides column headers when empty; empty body matches chart plot height.
 */
export function AnalyticsTopPatientsPanel({ patients, loading = false }: Props) {
  const empty = !loading && patients.length === 0;

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead className="text-right">Visits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
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
          "flex w-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground",
          insightsChartBodyMinHeightClass
        )}
        role="status"
        aria-live="polite"
      >
        <Inbox className="h-8 w-8 text-muted-foreground/60" aria-hidden />
        <p className={analyticsChartEmptyTitleClass}>No patient visits in this period</p>
        <p className={analyticsChartEmptyDescriptionClass}>
          Top patients will rank here when appointments are recorded in the selected range.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead className="text-right">Visits</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((p, idx) => (
          <TableRow key={`${p.name}-${idx}`}>
            <TableCell className="font-medium">{p.name}</TableCell>
            <TableCell className="text-right">
              <Badge variant="secondary">{p.count}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
