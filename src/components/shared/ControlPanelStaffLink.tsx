"use client";

import { EntityTitleLink } from "@/components/shared/EntityTitleLink";

type Props = {
  userId: string | null | undefined;
  label: string | null | undefined;
};

/**
 * Staff / doctor profile in control panel lives at `doctors/[id]` (same target as list rows & admin tables).
 */
export function ControlPanelStaffLink({ userId, label }: Props) {
  const t = label?.trim();
  if (!t) return null;
  if (userId) {
    return (
      <EntityTitleLink
        href={`/control-panel/doctors/${userId}`}
        label={t}
        className="inline font-medium"
      />
    );
  }
  return <span className="font-medium text-foreground">{t}</span>;
}
