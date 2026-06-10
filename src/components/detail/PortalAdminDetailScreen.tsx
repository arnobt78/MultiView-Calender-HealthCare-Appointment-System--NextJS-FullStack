"use client";

/**
 * Portal read-only admin account — doctors open from `/admins/:id` (calendar owner links).
 */
import { format } from "date-fns";
import { CalendarDays, Clock, Hash, Lock, Mail, Shield, ShieldCheck } from "lucide-react";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import { EntityDetailBackLink } from "@/components/shared/entity-detail/EntityDetailBackLink";
import { EntityDetailFooterRow } from "@/components/shared/entity-detail/EntityDetailFooterRow";
import { slateGlassBackButtonClass, skyGlassTableFrameClass } from "@/lib/calendar-header-action-styles";
import {
  entityDetailChromeSlateIconClass,
  entityDetailChromeSlateIconTileClass,
} from "@/lib/page-chrome-classes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { clinicalEmptyOr } from "@/components/shared/ClinicalTableEmptyDash";
import {
  entityDetailFieldIconCircleClass,
  entityDetailPageHeaderClass,
  patientDetailDefinitionListClass,
  patientDetailDefinitionRowClass,
  patientDetailSchemaSectionClass,
} from "@/lib/patient-detail-ui-classes";
import { resolveEntityDetailRootClass } from "@/lib/section-page-layout";
import { cn } from "@/lib/utils";
import type { User } from "@/types/types";
import { useLayoutEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useUser } from "@/hooks/useUsers";
import { EntityIdCopyInline } from "@/components/shared/EntityIdCopyInline";

export type PortalAdminDetailScreenProps = {
  userId: string;
  backHref: string;
  initialUser: User;
  appointmentCount: number;
  emailVerified: boolean;
};

function FieldLabel({ icon: Icon, children }: { icon: typeof Hash; children: React.ReactNode }) {
  return (
    <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500 sm:pt-0.5">
      <span className={entityDetailFieldIconCircleClass}>
        <Icon className="h-3 w-3 text-sky-600" aria-hidden />
      </span>
      {children}
    </dt>
  );
}

export function PortalAdminDetailScreen({
  userId,
  backHref,
  initialUser,
  appointmentCount,
  emailVerified,
}: PortalAdminDetailScreenProps) {
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    queryClient.setQueryData(queryKeys.users.detail(userId), initialUser);
  }, [queryClient, userId, initialUser]);

  const { data: user } = useUser(userId);
  const liveUser = user ?? initialUser;
  const displayName = liveUser.display_name?.trim() || liveUser.email;

  return (
    <div className={resolveEntityDetailRootClass("portal")}>
      <EntityDetailChromeHeader
        className={entityDetailPageHeaderClass}
        icon={Shield}
        iconTileClassName={entityDetailChromeSlateIconTileClass}
        iconClassName={entityDetailChromeSlateIconClass}
        title={displayName}
        description="Admin Account — Directory Profile"
        actions={
          <EntityDetailBackLink
            href={backHref}
            placement="header"
            backButtonClassName={slateGlassBackButtonClass}
          />
        }
      />

      <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-900">
        <Lock className="h-4 w-4 shrink-0" aria-hidden />
        Read-only admin profile — calendar owner reference from doctor directory.
      </div>

      <Card className={cn("flex-1 border-sky-100/50 bg-white/90", skyGlassTableFrameClass)}>
        <CardContent className="space-y-3 px-4 sm:px-6 text-gray-700">
          <div className={patientDetailSchemaSectionClass}>
            <div className="flex items-start gap-3">
              <UserAvatar
                src={liveUser.image}
                alt={displayName}
                fallbackText={displayName}
                sizeClassName="h-20 w-20"
                className="rounded-xl ring-2 ring-sky-200/70 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-lg font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">{liveUser.email}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <UserRoleBadge role={liveUser.role} />
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] py-0",
                      emailVerified
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}
                  >
                    {emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
            </div>

            <dl className={patientDetailDefinitionListClass}>
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={Hash}>User ID</FieldLabel>
                <dd>
                  <EntityIdCopyInline value={liveUser.id} />
                </dd>
              </div>
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={Mail}>Email</FieldLabel>
                <dd className="text-sm">{liveUser.email}</dd>
              </div>
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={ShieldCheck}>Role</FieldLabel>
                <dd className="capitalize">{clinicalEmptyOr(liveUser.role, "definition")}</dd>
              </div>
              {liveUser.created_at ? (
                <div className={patientDetailDefinitionRowClass}>
                  <FieldLabel icon={Clock}>Joined</FieldLabel>
                  <dd>{format(new Date(liveUser.created_at), "PP")}</dd>
                </div>
              ) : null}
              <div className={patientDetailDefinitionRowClass}>
                <FieldLabel icon={CalendarDays}>Appointments Owned</FieldLabel>
                <dd className="font-medium">{appointmentCount}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      <EntityDetailFooterRow
        backHref={backHref}
        backButtonClassName={slateGlassBackButtonClass}
      />
    </div>
  );
}
