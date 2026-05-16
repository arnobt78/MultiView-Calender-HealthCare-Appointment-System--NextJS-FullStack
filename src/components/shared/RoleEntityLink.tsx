"use client";

/**
 * Client link that picks `/control-panel/*` vs portal detail routes from the signed-in role.
 */
import { useAuth } from "@/hooks/useAuth";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import {
  appointmentDetailHref,
  categoryDetailHref,
  doctorDetailHref,
  patientDetailHref,
} from "@/lib/entity-routes";

type BaseProps = {
  label: string;
  className?: string;
};

type AppointmentProps = BaseProps & { kind: "appointment"; id: string };
type PatientProps = BaseProps & { kind: "patient"; id: string };
type CategoryProps = BaseProps & { kind: "category"; id: string };
type DoctorProps = BaseProps & { kind: "doctor"; id: string };

export type RoleEntityLinkProps = AppointmentProps | PatientProps | CategoryProps | DoctorProps;

export function RoleEntityLink(props: RoleEntityLinkProps) {
  const { user } = useAuth();
  const role = user?.role ?? null;

  const href =
    props.kind === "appointment"
      ? appointmentDetailHref(role, props.id)
      : props.kind === "patient"
        ? patientDetailHref(role, props.id)
        : props.kind === "category"
          ? categoryDetailHref(role, props.id)
          : doctorDetailHref(role, props.id);

  return <EntityTitleLink href={href} label={props.label} className={props.className} />;
}
