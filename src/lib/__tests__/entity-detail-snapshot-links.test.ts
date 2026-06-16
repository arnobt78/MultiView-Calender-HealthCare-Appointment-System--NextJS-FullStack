import { describe, expect, it } from "vitest";
import {
  APPOINTMENT_DETAIL_PORTAL_DOCTOR_LINKS,
  APPOINTMENT_DETAIL_PORTAL_PATIENT_LINKS,
  DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS,
  DOCTOR_DETAIL_PATIENT_SNAPSHOT_LINKS,
  resolveCalendarOwnerLinkKind,
  resolveDoctorDetailSnapshotLinkPolicy,
  resolvePortalAppointmentDetailLinkPolicy,
  resolvePortalEntityDetailSnapshotLinkPolicy,
  resolveTreatingPhysicianLinkKind,
} from "@/lib/entity-detail-snapshot-links";

describe("resolvePortalEntityDetailSnapshotLinkPolicy", () => {
  it("returns patient policy for patient role", () => {
    expect(resolvePortalEntityDetailSnapshotLinkPolicy("patient")).toBe(
      DOCTOR_DETAIL_PATIENT_SNAPSHOT_LINKS
    );
  });

  it("returns doctor policy for doctor role", () => {
    expect(resolvePortalEntityDetailSnapshotLinkPolicy("doctor")).toBe(
      DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS
    );
  });

  it("aliases resolveDoctorDetailSnapshotLinkPolicy", () => {
    expect(resolveDoctorDetailSnapshotLinkPolicy("patient")).toBe(
      resolvePortalEntityDetailSnapshotLinkPolicy("patient")
    );
  });
});

describe("resolvePortalAppointmentDetailLinkPolicy", () => {
  it("doctor portal appointment detail links patient in title", () => {
    const policy = resolvePortalAppointmentDetailLinkPolicy("doctor");
    expect(policy).toBe(APPOINTMENT_DETAIL_PORTAL_DOCTOR_LINKS);
    expect(policy?.patientInTitle).toBe(true);
  });

  it("patient portal appointment detail keeps patient title plain", () => {
    const policy = resolvePortalAppointmentDetailLinkPolicy("patient");
    expect(policy).toBe(APPOINTMENT_DETAIL_PORTAL_PATIENT_LINKS);
    expect(policy?.patientInTitle).toBe(false);
  });

  it("does not change doctor detail snapshot policy", () => {
    expect(DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS.patientInTitle).toBe(false);
    expect(resolvePortalEntityDetailSnapshotLinkPolicy("doctor")?.patientInTitle).toBe(
      false
    );
  });
});

describe("doctor detail snapshot calendar owner links", () => {
  it("patient viewer: admin owner is plain text", () => {
    expect(
      resolveCalendarOwnerLinkKind("patient", "admin", DOCTOR_DETAIL_PATIENT_SNAPSHOT_LINKS)
    ).toBe("none");
  });

  it("patient viewer: doctor owner may link", () => {
    expect(
      resolveCalendarOwnerLinkKind("patient", "doctor", DOCTOR_DETAIL_PATIENT_SNAPSHOT_LINKS)
    ).toBe("role");
  });

  it("doctor viewer: admin owner links to portal admin profile", () => {
    expect(
      resolveCalendarOwnerLinkKind("doctor", "admin", DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS)
    ).toBe("portal-admin");
  });

  it("doctor viewer: doctor calendar owner links to portal doctor detail", () => {
    expect(
      resolveCalendarOwnerLinkKind("doctor", "doctor", DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS)
    ).toBe("role");
  });

  it("portal doctor detail keeps category and treating doctor links enabled", () => {
    expect(DOCTOR_DETAIL_PATIENT_SNAPSHOT_LINKS.categoryLink).toBe(true);
    expect(DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS.treatingPhysicianLink).toBe(true);
  });

  it("doctor viewer: treating physician uses same rules as calendar owner", () => {
    expect(
      resolveTreatingPhysicianLinkKind("doctor", DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS, "doctor")
    ).toBe("role");
    expect(
      resolveTreatingPhysicianLinkKind("doctor", DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS, "admin")
    ).toBe("portal-admin");
  });
});

/** Invoice linked visit panel — reuses portal snapshot policy + visit_summary roles. */
describe("invoice linked visit clinician link kinds", () => {
  it("patient viewer: admin calendar owner plain (invoice visit panel)", () => {
    expect(
      resolveCalendarOwnerLinkKind(
        "patient",
        "admin",
        DOCTOR_DETAIL_PATIENT_SNAPSHOT_LINKS
      )
    ).toBe("none");
    expect(
      resolveTreatingPhysicianLinkKind(
        "patient",
        DOCTOR_DETAIL_PATIENT_SNAPSHOT_LINKS,
        "admin"
      )
    ).toBe("none");
  });

  it("doctor viewer: admin owner portal-admin when role on summary", () => {
    expect(
      resolveCalendarOwnerLinkKind(
        "doctor",
        "admin",
        DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS
      )
    ).toBe("portal-admin");
    expect(
      resolveTreatingPhysicianLinkKind(
        "doctor",
        DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS,
        "admin"
      )
    ).toBe("portal-admin");
  });
});

describe("resolveCalendarOwnerLinkKind legacy default", () => {
  it("admin viewer uses admin-cp without policy", () => {
    expect(resolveCalendarOwnerLinkKind("admin", "admin")).toBe("admin-cp");
  });

  it("doctor viewer uses role without policy", () => {
    expect(resolveCalendarOwnerLinkKind("doctor", "doctor")).toBe("role");
  });
});
