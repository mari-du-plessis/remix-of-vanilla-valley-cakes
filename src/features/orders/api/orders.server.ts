import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { OrderDetail, OrderListItem, OrderStatus } from "../types";
import { createOrderSchema, listOrdersSchema } from "./schema";
import type { z } from "zod";

type Client = SupabaseClient<Database>;

const CUSTOMER_SELECT = "id, name, phone, email";

const LIST_SELECT = `
  id, order_number, status, channel, occasion, event_date, created_at,
  customer:customers (${CUSTOMER_SELECT})
`;

const DETAIL_SELECT = `
  id, order_number, status, channel, occasion, event_date, created_at,
  customer_notes, internal_notes, inspiration_url, summary,
  customer:customers (${CUSTOMER_SELECT}),
  items:order_items (
    id, name, size_label, quantity, position,
    options:order_item_options (id, group_key, group_label, value_label, tier_index, position)
  ),
  history:order_status_history (id, from_status, to_status, note, created_at)
`;

/* eslint-disable @typescript-eslint/no-explicit-any */

const mapCustomer = (row: any) =>
  row
    ? { id: row.id, name: row.name, phone: row.phone, email: row.email ?? null }
    : null;

export const mapOrderListItem = (row: any): OrderListItem => ({
  id: row.id,
  orderNumber: row.order_number,
  status: row.status,
  channel: row.channel,
  occasion: row.occasion ?? null,
  eventDate: row.event_date ?? null,
  createdAt: row.created_at,
  customer: mapCustomer(row.customer),
});

export const mapOrderDetail = (row: any): OrderDetail => ({
  ...mapOrderListItem(row),
  customerNotes: row.customer_notes ?? null,
  internalNotes: row.internal_notes ?? null,
  inspirationUrl: row.inspiration_url ?? null,
  summary: row.summary ?? null,
  items: [...(row.items ?? [])]
    .sort((a: any, b: any) => a.position - b.position)
    .map((item: any) => ({
      id: item.id,
      name: item.name,
      sizeLabel: item.size_label ?? null,
      quantity: item.quantity,
      options: [...(item.options ?? [])]
        .sort((a: any, b: any) => a.position - b.position)
        .map((option: any) => ({
          id: option.id,
          groupKey: option.group_key,
          groupLabel: option.group_label,
          valueLabel: option.value_label,
          tierIndex: option.tier_index ?? null,
        })),
    })),
  history: [...(row.history ?? [])]
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .map((event: any) => ({
      id: event.id,
      fromStatus: event.from_status ?? null,
      toStatus: event.to_status,
      note: event.note ?? null,
      createdAt: event.created_at,
    })),
});

/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Persists a public enquiry. Runs with elevated privileges because the
 * customer is anonymous — every field is validated before it is written and
 * nothing is read back beyond the new order's identifiers.
 */
export async function createOrderRecord(input: z.infer<typeof createOrderSchema>) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let customerId = input.customerId ?? null;
  if (!customerId) {
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .upsert(
        {
          phone: input.customer.phone,
          name: input.customer.name,
          email: input.customer.email || null,
        },
        { onConflict: "phone" },
      )
      .select("id")
      .single();
    if (customerError) throw new Error(customerError.message);
    customerId = customer.id;
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_id: customerId,
      channel: input.channel,
      status: input.status,
      occasion: input.occasion || null,
      event_date: input.eventDate || null,
      customer_notes: input.customerNotes || null,
      internal_notes: input.internalNotes || null,
      inspiration_url: input.inspirationUrl || null,
      summary: input.summary || null,
    })
    .select("id, order_number")
    .single();
  if (orderError) throw new Error(orderError.message);


  for (const [index, item] of input.items.entries()) {
    const { data: savedItem, error: itemError } = await supabaseAdmin
      .from("order_items")
      .insert({
        order_id: order.id,
        name: item.name,
        description: item.description || null,
        size_id: item.sizeId || null,
        size_label: item.sizeLabel || null,
        quantity: item.quantity,
        position: index,
      })
      .select("id")
      .single();
    if (itemError) throw new Error(itemError.message);

    if (item.options.length > 0) {
      const { error: optionsError } = await supabaseAdmin
        .from("order_item_options")
        .insert(
          item.options.map((option, position) => ({
            order_item_id: savedItem.id,
            group_key: option.groupKey,
            group_label: option.groupLabel,
            value_key: option.valueKey || null,
            value_label: option.valueLabel,
            tier_index: option.tierIndex ?? null,
            position,
          })),
        );
      if (optionsError) throw new Error(optionsError.message);
    }
  }

  return { id: order.id, orderNumber: order.order_number };
}

/** Admin list read — RLS restricts rows to admins. */
export async function fetchOrders(
  supabase: Client,
  filters: z.infer<typeof listOrdersSchema>,
): Promise<OrderListItem[]> {
  let query = supabase
    .from("orders")
    .select(LIST_SELECT)
    .order("created_at", { ascending: false })
    .limit(filters.limit);

  if (filters.status !== "all") query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []).map(mapOrderListItem);
  const search = filters.search?.toLowerCase();
  if (!search) return rows;

  return rows.filter((row) =>
    [row.orderNumber, row.customer?.name, row.customer?.phone, row.occasion]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(search)),
  );
}

export async function fetchOrder(supabase: Client, orderId: string): Promise<OrderDetail> {
  const { data, error } = await supabase
    .from("orders")
    .select(DETAIL_SELECT)
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Order not found");
  return mapOrderDetail(data);
}

export async function setOrderStatus(
  supabase: Client,
  orderId: string,
  status: OrderStatus,
) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function setOrderInternalNotes(
  supabase: Client,
  orderId: string,
  internalNotes: string,
) {
  const { error } = await supabase
    .from("orders")
    .update({ internal_notes: internalNotes || null })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}
