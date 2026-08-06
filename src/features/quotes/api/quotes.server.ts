import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { calculateQuote } from "@/features/pricing/lib/pricing-engine";
import type { QuoteLineRequest, QuoteRequest } from "@/features/pricing/lib/pricing-engine";
import {
  fetchPriceListItems,
  fetchPriceLists,
  fetchPricingRules,
} from "@/features/pricing/api/pricing.server";
import type { PricingSnapshot } from "@/features/pricing/types";
import type { QuoteDetail, QuoteLineItem, QuoteListItem, QuoteStatus } from "../types";
import type { QuoteLineInput } from "./schema";

type Client = SupabaseClient<Database>;

/* eslint-disable @typescript-eslint/no-explicit-any */

/* --------------------------------- mappers -------------------------------- */

const mapLine = (row: any): QuoteLineItem => ({
  id: row.id,
  quoteId: row.quote_id,
  kind: row.kind,
  priceListItemId: row.price_list_item_id ?? null,
  pricingRuleId: row.pricing_rule_id ?? null,
  productId: row.product_id ?? null,
  optionId: row.option_id ?? null,
  label: row.label,
  detail: row.detail ?? null,
  quantity: row.quantity,
  unitCents: row.unit_cents,
  amountCents: row.amount_cents,
  position: row.position,
});

const mapListItem = (row: any): QuoteListItem => ({
  id: row.id,
  quoteNumber: row.quote_number,
  revision: row.revision,
  status: row.status,
  currency: row.currency,
  quoteDate: row.quote_date,
  validUntil: row.valid_until ?? null,
  totalCents: row.total_cents,
  createdAt: row.created_at,
  orderId: row.order_id,
  orderNumber: row.order?.order_number ?? null,
  customerName: row.order?.customer?.name ?? null,
  eventDate: row.order?.event_date ?? null,
});

const mapDetail = (row: any): QuoteDetail => ({
  ...mapListItem(row),
  priceListId: row.price_list_id ?? null,
  depositPercent: row.deposit_percent,
  depositCents: row.deposit_cents,
  subtotalCents: row.subtotal_cents,
  discountCents: row.discount_cents,
  notes: row.notes ?? null,
  terms: row.terms ?? null,
  internalNotes: row.internal_notes ?? null,
  customerPhone: row.order?.customer?.phone ?? null,
  customerEmail: row.order?.customer?.email ?? null,
  occasion: row.order?.occasion ?? null,
  lines: [...(row.lines ?? [])].sort((a: any, b: any) => a.position - b.position).map(mapLine),
  quoteNotes: [...(row.quote_notes ?? [])]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((note: any) => ({
      id: note.id,
      quoteId: note.quote_id,
      body: note.body,
      createdAt: note.created_at,
    })),
  history: [...(row.history ?? [])]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((event: any) => ({
      id: event.id,
      fromStatus: event.from_status ?? null,
      toStatus: event.to_status,
      note: event.note ?? null,
      createdAt: event.created_at,
    })),
});

/* eslint-enable @typescript-eslint/no-explicit-any */

const ORDER_JOIN = `order:orders (order_number, event_date, occasion, customer:customers (name, phone, email))`;

const LIST_SELECT = `
  id, quote_number, revision, status, currency, quote_date, valid_until,
  total_cents, created_at, order_id, ${ORDER_JOIN}
`;

const DETAIL_SELECT = `
  ${LIST_SELECT},
  price_list_id, deposit_percent, deposit_cents, subtotal_cents, discount_cents,
  notes, terms, internal_notes,
  lines:quote_line_items (*),
  quote_notes:quote_notes (*),
  history:quote_status_history (id, from_status, to_status, note, created_at)
`;

/* ---------------------------------- reads --------------------------------- */

export async function fetchQuotes(
  client: Client,
  filters: { status: QuoteStatus | "all"; search?: string; orderId?: string; limit: number },
): Promise<QuoteListItem[]> {
  let query = client
    .from("quotes")
    .select(LIST_SELECT)
    .order("created_at", { ascending: false })
    .limit(filters.limit);

  if (filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.orderId) query = query.eq("order_id", filters.orderId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []).map(mapListItem);
  const search = filters.search?.trim().toLowerCase();
  if (!search) return rows;
  return rows.filter((row) =>
    [row.quoteNumber, row.orderNumber, row.customerName]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(search)),
  );
}

export async function fetchQuote(client: Client, quoteId: string): Promise<QuoteDetail> {
  const { data, error } = await client
    .from("quotes")
    .select(DETAIL_SELECT)
    .eq("id", quoteId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Quote not found");
  return mapDetail(data);
}

/* -------------------------------- generation ------------------------------ */

async function loadSnapshot(
  client: Client,
  priceListId?: string | null,
): Promise<PricingSnapshot | null> {
  const lists = await fetchPriceLists(client);
  const priceList =
    lists.find((list) => list.id === priceListId) ??
    lists.find((list) => list.isDefault) ??
    lists[0];
  if (!priceList) return null;
  const [items, rules] = await Promise.all([
    fetchPriceListItems(client, priceList.id),
    fetchPricingRules(client, priceList.id),
  ]);
  return { priceList, items, rules };
}

const daysUntil = (date: string | null) => {
  if (!date) return null;
  const diff = new Date(`${date}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.round(diff / 86_400_000);
};

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

/** Translates a stored order into the pricing engine's request shape. */
function buildQuoteRequest(order: {
  event_date: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
}): QuoteRequest {
  const lines: QuoteLineRequest[] = (order.items ?? []).map((item) => {
    const options = item.options ?? [];

    const tierIndexes = options
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((option: any) => option.tier_index)
      .filter((index: number | null) => index !== null && index !== undefined);
    return {
      name: [item.name, item.size_label].filter(Boolean).join(" · "),
      productId: item.product_id ?? null,
      sizeKey: item.size_id ?? null,
      tierCount: tierIndexes.length ? new Set(tierIndexes).size : null,
      quantity: item.quantity ?? 1,
      optionIds: options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((option: any) => option.option_id)
        .filter(Boolean) as string[],
    };
  });

  return {
    lines,
    eventDate: order.event_date ?? null,
    leadTimeDays: daysUntil(order.event_date ?? null),
  };
}

const KIND_BY_SOURCE = {
  product: "product",
  option: "option",
  tier: "tier",
  delivery: "delivery",
  rush: "rush",
  rule: "rule",
  custom: "custom",
} as const;

/**
 * Creates the next quote revision for an order by running the pricing engine
 * over the stored order. The result is fully editable afterwards — the engine
 * only supplies the starting point.
 */
export async function generateQuote(
  client: Client,
  input: { orderId: string; priceListId?: string | null; validForDays: number },
  userId: string,
) {
  const { data: order, error: orderError } = await client
    .from("orders")
    .select(
      `id, event_date, currency,
       items:order_items (id, name, product_id, size_id, size_label, quantity, position,
         options:order_item_options (option_id, tier_index, value_label))`,
    )
    .eq("id", input.orderId)
    .maybeSingle();
  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("Order not found");

  const snapshot = await loadSnapshot(client, input.priceListId);
  if (!snapshot) throw new Error("Add a price list before generating quotes");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const breakdown = calculateQuote(snapshot, buildQuoteRequest(order as any));

  const { data: previous } = await client
    .from("quotes")
    .select("revision")
    .eq("order_id", input.orderId)
    .order("revision", { ascending: false })
    .limit(1);
  const revision = (previous?.[0]?.revision ?? 0) + 1;

  const { data: quote, error: quoteError } = await client
    .from("quotes")
    .insert({
      order_id: input.orderId,
      revision,
      price_list_id: snapshot.priceList.id,
      currency: snapshot.priceList.currency,
      valid_until: addDays(input.validForDays),
      created_by: userId,
    })
    .select("id")
    .single();
  if (quoteError) throw new Error(quoteError.message);

  if (breakdown.lines.length > 0) {
    const { error: linesError } = await client.from("quote_line_items").insert(
      breakdown.lines.map((line, position) => ({
        quote_id: quote.id,
        kind: KIND_BY_SOURCE[line.source],
        label: line.label,
        detail: line.detail ?? null,
        quantity: line.quantity,
        unit_cents: line.unitCents,
        amount_cents: line.amountCents,
        position,
      })),
    );
    if (linesError) throw new Error(linesError.message);
  }

  await recalculateQuote(client, quote.id);
  // A quote exists, so the order has been quoted.
  await client.from("orders").update({ status: "quoted" }).eq("id", input.orderId);

  return { id: quote.id };
}

/* --------------------------------- writes --------------------------------- */

/** Totals are always derived from the stored lines — never trusted from the client. */
export async function recalculateQuote(client: Client, quoteId: string) {
  const [{ data: lines, error: linesError }, { data: quote, error: quoteError }] =
    await Promise.all([
      client.from("quote_line_items").select("kind, amount_cents").eq("quote_id", quoteId),
      client.from("quotes").select("deposit_percent").eq("id", quoteId).single(),
    ]);
  if (linesError) throw new Error(linesError.message);
  if (quoteError) throw new Error(quoteError.message);

  const rows = lines ?? [];
  const subtotal = rows
    .filter((line) => line.kind !== "discount")
    .reduce((total, line) => total + line.amount_cents, 0);
  const discount = rows
    .filter((line) => line.kind === "discount")
    .reduce((total, line) => total + Math.abs(line.amount_cents), 0);
  const total = subtotal - discount;

  const { error } = await client
    .from("quotes")
    .update({
      subtotal_cents: subtotal,
      discount_cents: discount,
      total_cents: total,
      deposit_cents: Math.round((total * (quote.deposit_percent ?? 0)) / 100),
    })
    .eq("id", quoteId);
  if (error) throw new Error(error.message);
  return { subtotalCents: subtotal, discountCents: discount, totalCents: total };
}

export async function insertQuoteLine(client: Client, input: QuoteLineInput) {
  const quantity = input.quantity ?? 1;
  const { error } = await client.from("quote_line_items").insert({
    quote_id: input.quoteId,
    kind: input.kind ?? "custom",
    price_list_item_id: input.priceListItemId ?? null,
    label: input.label,
    detail: input.detail ?? null,
    quantity,
    unit_cents: input.unitCents,
    amount_cents: input.unitCents * quantity,
    position: input.position ?? 0,
  });
  if (error) throw new Error(error.message);
  return recalculateQuote(client, input.quoteId);
}

export async function updateQuoteLine(
  client: Client,
  id: string,
  values: Partial<Omit<QuoteLineInput, "quoteId">>,
) {
  const { data: existing, error: readError } = await client
    .from("quote_line_items")
    .select("quote_id, quantity, unit_cents")
    .eq("id", id)
    .single();
  if (readError) throw new Error(readError.message);

  const quantity = values.quantity ?? existing.quantity;
  const unitCents = values.unitCents ?? existing.unit_cents;

  const { error } = await client
    .from("quote_line_items")
    .update({
      ...(values.kind ? { kind: values.kind } : {}),
      ...(values.priceListItemId !== undefined
        ? { price_list_item_id: values.priceListItemId }
        : {}),
      ...(values.label !== undefined ? { label: values.label } : {}),
      ...(values.detail !== undefined ? { detail: values.detail } : {}),
      ...(values.position !== undefined ? { position: values.position } : {}),
      quantity,
      unit_cents: unitCents,
      amount_cents: quantity * unitCents,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return recalculateQuote(client, existing.quote_id);
}

export async function deleteQuoteLine(client: Client, id: string) {
  const { data: existing, error: readError } = await client
    .from("quote_line_items")
    .select("quote_id")
    .eq("id", id)
    .single();
  if (readError) throw new Error(readError.message);
  const { error } = await client.from("quote_line_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return recalculateQuote(client, existing.quote_id);
}

export async function updateQuoteSettings(
  client: Client,
  id: string,
  values: {
    status?: QuoteStatus;
    quoteDate?: string;
    validUntil?: string | null;
    depositPercent?: number;
    notes?: string | null;
    terms?: string | null;
    internalNotes?: string | null;
  },
) {
  const { error } = await client
    .from("quotes")
    .update({
      ...(values.status ? { status: values.status } : {}),
      ...(values.status === "finalised" ? { finalised_at: new Date().toISOString() } : {}),
      ...(values.quoteDate ? { quote_date: values.quoteDate } : {}),
      ...(values.validUntil !== undefined ? { valid_until: values.validUntil } : {}),
      ...(values.depositPercent !== undefined ? { deposit_percent: values.depositPercent } : {}),
      ...(values.notes !== undefined ? { notes: values.notes } : {}),
      ...(values.terms !== undefined ? { terms: values.terms } : {}),
      ...(values.internalNotes !== undefined ? { internal_notes: values.internalNotes } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  // Accepting a quote confirms the order it belongs to. The rest of the order
  // lifecycle is untouched; already-progressed orders are left alone.
  if (values.status === "accepted") {
    const { data: quoteRow } = await client.from("quotes").select("order_id").eq("id", id).single();
    if (quoteRow?.order_id) {
      await client
        .from("orders")
        .update({ status: "confirmed" })
        .eq("id", quoteRow.order_id)
        .in("status", ["enquiry", "quoted"]);
    }
  }

  if (values.depositPercent !== undefined) await recalculateQuote(client, id);
  return { id };
}

export async function insertQuoteNote(
  client: Client,
  input: { quoteId: string; body: string },
  userId: string,
) {
  const { error } = await client
    .from("quote_notes")
    .insert({ quote_id: input.quoteId, body: input.body, created_by: userId });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function deleteQuoteRow(client: Client, id: string) {
  const { error } = await client.from("quotes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { id };
}
