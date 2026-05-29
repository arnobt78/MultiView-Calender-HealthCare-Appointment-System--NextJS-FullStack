"use client";

/**
 * Legacy client-only entry — not used by App Router.
 * Canonical detail: `src/app/control-panel/patients/[id]/page.tsx` → `PatientDetailScreen` (SSR prefetch).
 * If this component mounts (old import), redirect to the SSR route so behavior matches CP detail.
 */
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : null;

  useEffect(() => {
    if (id) {
      router.replace(`/control-panel/patients/${id}`);
      return;
    }
    router.replace("/control-panel/patient-management");
  }, [id, router]);

  return null;
}
