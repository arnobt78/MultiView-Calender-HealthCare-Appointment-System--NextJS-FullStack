"use client";

import { Stethoscope } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { AdminPortalDoctorDirectoryCard } from "@/components/admin-portal/AdminPortalDoctorDirectoryCard";
import type { DoctorRow } from "@/types/types";

type Props = {
  doctors: DoctorRow[];
  listLoading?: boolean;
};

/** Full doctor directory — natural page scroll (no inner max-height). */
export function AdminPortalDoctorDirectoryPanel({ doctors, listLoading = false }: Props) {
  return (
    <PortalPanelSection
      title="Doctor Directory"
      subtitle="Active profiles, availability, and visit types"
      icon={Stethoscope}
      iconClassName="border-violet-100 bg-violet-50 [&_svg]:text-violet-600"
      count={doctors.length}
      countSkeleton={listLoading}
    >
      {listLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Stethoscope className="mb-2 h-8 w-8 opacity-40" aria-hidden />
          <p className="text-sm">No doctors registered</p>
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map((doctor) => (
            <AdminPortalDoctorDirectoryCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </PortalPanelSection>
  );
}
