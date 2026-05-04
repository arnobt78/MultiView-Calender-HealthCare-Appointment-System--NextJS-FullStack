"use client";

import { EntityTitleLink } from "@/components/shared/EntityTitleLink";

type Props = {
  userId: string | null | undefined;
  label: string | null | undefined;
  /** Shown in parentheses after the linked name (audit trail). */
  email?: string | null;
};

/**
 * Staff / doctor profile in control panel lives at `doctors/[id]` (same target as list rows & admin tables).
 */
export function ControlPanelStaffLink({ userId, label, email }: Props) {
  const t = label?.trim();
  if (!t) return null;
  const em = email?.trim();
  if (userId) {
    return (
      <span className="inline text-gray-700">
        <EntityTitleLink
          href={`/control-panel/doctors/${userId}`}
          label={t}
          className="font-normal"
        />
        {em ? <span className="text-gray-600"> ({em})</span> : null}
      </span>
    );
  }
  return (
    <span className="text-gray-700">
      {t}
      {em ? <span className="text-gray-600"> ({em})</span> : null}
    </span>
  );
}
