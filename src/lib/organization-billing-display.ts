/**
 * Organization CP billing panel — possessive section title + subtitle (doctor portal parity).
 */

/** Muted subtitle under stacked header — org-scoped invoice counts. */
export const ORGANIZATION_BILLING_SUBTITLE =
  "Invoices tagged to this organisation — counts by payment status";

/** Panel title — possessive when organisation display name is known. */
export function organizationBillingSectionTitle(
  orgName: string | null | undefined
): string {
  const name = orgName?.trim();
  if (!name) return "Related Billing";
  return `${name}'s Related Billing`;
}
