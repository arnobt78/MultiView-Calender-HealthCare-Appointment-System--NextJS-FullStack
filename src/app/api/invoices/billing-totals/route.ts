import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { userCanViewOrganizationInvoices } from "@/lib/organization-invoice-access";
import { fetchInvoiceBillingTotalsForOrganization } from "@/lib/invoices-scope";

export const dynamic = "force-dynamic";

/**
 * Org billing KPI aggregate endpoint.
 * Uses Prisma aggregates server-side to avoid deriving KPI cards from full invoice list payloads.
 */
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const organizationId = req.nextUrl.searchParams.get("organizationId");
    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const role = await getUserRole(sessionUser.userId);
    const allowed =
      isAdminRole(role) ||
      (await userCanViewOrganizationInvoices(sessionUser.userId, organizationId));
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const payload = await fetchInvoiceBillingTotalsForOrganization(organizationId);
    return NextResponse.json(payload);
  } catch (error: unknown) {
    console.error("Invoice billing totals GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice billing totals" },
      { status: 500 }
    );
  }
}
