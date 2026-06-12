import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { userCanViewOrganizationInvoices } from "@/lib/organization-invoice-access";
import {
  fetchInvoiceBillingTotalsForDoctor,
  fetchInvoiceBillingTotalsForOrganization,
  fetchInvoiceBillingTotalsForViewer,
} from "@/lib/invoices-scope";
import { isValidUUID } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * Scoped billing KPI aggregate endpoint — viewer (no params), org, or doctor (XOR).
 * Uses Prisma aggregates server-side to avoid deriving KPI cards from full list payloads.
 */
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const organizationId = req.nextUrl.searchParams.get("organizationId")?.trim();
    const doctorId = req.nextUrl.searchParams.get("doctorId")?.trim();

    if (organizationId && doctorId) {
      return NextResponse.json(
        { error: "organizationId and doctorId are mutually exclusive" },
        { status: 400 }
      );
    }

    const role = await getUserRole(sessionUser.userId);

    if (organizationId) {
      if (!isValidUUID(organizationId)) {
        return NextResponse.json({ error: "Invalid organizationId" }, { status: 400 });
      }
      const allowed =
        isAdminRole(role) ||
        (await userCanViewOrganizationInvoices(sessionUser.userId, organizationId));
      if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const payload = await fetchInvoiceBillingTotalsForOrganization(organizationId);
      return NextResponse.json(payload);
    }

    if (doctorId) {
      if (!isValidUUID(doctorId)) {
        return NextResponse.json({ error: "Invalid doctorId" }, { status: 400 });
      }
      const allowed = isAdminRole(role) || doctorId === sessionUser.userId;
      if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const payload = await fetchInvoiceBillingTotalsForDoctor(doctorId);
      return NextResponse.json(payload);
    }

    const payload = await fetchInvoiceBillingTotalsForViewer({
      userId: sessionUser.userId,
      role,
      email: sessionUser.email,
    });
    return NextResponse.json(payload);
  } catch (error: unknown) {
    console.error("Invoice billing totals GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice billing totals" },
      { status: 500 }
    );
  }
}
