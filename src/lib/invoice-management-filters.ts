/** CP invoice-management status toolbar filter — shared by scope context + list UI. */
export type InvoiceStatusFilter =
  | "all"
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";
