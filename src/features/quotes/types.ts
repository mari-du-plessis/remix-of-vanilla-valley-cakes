import type { Database } from "@/integrations/supabase/types";

export type QuoteStatus = Database["public"]["Enums"]["quote_status"];
export type QuoteLineKind = Database["public"]["Enums"]["quote_line_kind"];

/** One editable line on a quote. Mirrors `quote_line_items`. */
export type QuoteLineItem = {
  id: string;
  quoteId: string;
  kind: QuoteLineKind;
  priceListItemId: string | null;
  pricingRuleId: string | null;
  productId: string | null;
  optionId: string | null;
  label: string;
  detail: string | null;
  quantity: number;
  unitCents: number;
  amountCents: number;
  position: number;
};

export type QuoteNote = {
  id: string;
  quoteId: string;
  body: string;
  createdAt: string;
};

export type QuoteStatusEvent = {
  id: string;
  fromStatus: QuoteStatus | null;
  toStatus: QuoteStatus;
  note: string | null;
  createdAt: string;
};

/** Light row used by the admin quote list. */
export type QuoteListItem = {
  id: string;
  quoteNumber: string;
  revision: number;
  status: QuoteStatus;
  currency: string;
  quoteDate: string;
  validUntil: string | null;
  totalCents: number;
  createdAt: string;
  orderId: string;
  orderNumber: string | null;
  customerName: string | null;
  eventDate: string | null;
};

export type QuoteDetail = QuoteListItem & {
  priceListId: string | null;
  depositPercent: number;
  depositCents: number;
  subtotalCents: number;
  discountCents: number;
  notes: string | null;
  terms: string | null;
  internalNotes: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  occasion: string | null;
  lines: QuoteLineItem[];
  quoteNotes: QuoteNote[];
  history: QuoteStatusEvent[];
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  finalised: "Finalised",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
  archived: "Archived",
};

/** Tailwind classes per status, matching the order badge language. */
export const QUOTE_STATUS_STYLES: Record<QuoteStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  finalised: "bg-primary/10 text-primary",
  sent: "bg-blue-500/10 text-blue-600",
  accepted: "bg-emerald-500/10 text-emerald-600",
  declined: "bg-destructive/10 text-destructive",
  expired: "bg-amber-500/10 text-amber-600",
  archived: "bg-muted text-muted-foreground",
};

export const QUOTE_LINE_KIND_LABELS: Record<QuoteLineKind, string> = {
  product: "Product",
  option: "Option",
  tier: "Tier",
  service: "Service",
  delivery: "Delivery",
  rush: "Rush fee",
  rule: "Adjustment",
  discount: "Discount",
  charge: "Additional charge",
  custom: "Custom",
};

/** Statuses a quote may move to from the editor. */
export const QUOTE_STATUS_FLOW: QuoteStatus[] = [
  "draft",
  "finalised",
  "sent",
  "accepted",
  "declined",
  "expired",
  "archived",
];
