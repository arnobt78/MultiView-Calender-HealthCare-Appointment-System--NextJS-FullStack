import { describe, expect, it } from "vitest";
import {
  DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS,
  DOCTOR_DETAIL_PATIENT_SNAPSHOT_LINKS,
  resolveCalendarOwnerLinkKind,
  resolveDoctorDetailSnapshotLinkPolicy,
  resolveTreatingPhysicianLinkKind,
} from "@/lib/entity-detail-snapshot-links";

describe("resolveDoctorDetailSnapshotLinkPolicy", () => {
  it("returns patient policy for patient role", () => {
    expect(resolveDoctorDetailSnapshotLinkPolicy("patient")).toBe(
      DOCTOR_DETAIL_PATIENT_SNAPSHOT_LINKS
    );
  });

  it("returns doctor policy for doctor role", () => {
    expect(resolveDoctorDetailSnapshotLinkPolicy("doctor")).toBe(
      DOCTOR_DETAIL_DOCTOR_SNAPSHOT_LINKS
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

  it("doctor viewer: admin owner links to portal staff", () => {
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

describe("resolveCalendarOwnerLinkKind legacy default", () => {
  it("admin viewer uses admin-cp without policy", () => {
    expect(resolveCalendarOwnerLinkKind("admin", "admin")).toBe("admin-cp");
  });

  it("doctor viewer uses role without policy", () => {
    expect(resolveCalendarOwnerLinkKind("doctor", "doctor")).toBe("role");
  });
});
