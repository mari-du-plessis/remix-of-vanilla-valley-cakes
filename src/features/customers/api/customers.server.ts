import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { mapOrderListItem } from "@/features/orders/api/orders.server";
import type { OrderListItem } from "@/features/orders/types";
import type {
  Customer,
  CustomerAddress,
  CustomerDetail,
  CustomerNote,
  CustomerStats,
} from "../types";
import type { AddressInput, CustomerInput, ListCustomersInput } from "./schema";

type Client = SupabaseClient<Database>;

/* eslint-disable @typescript-eslint/no-explicit-any */

const CUSTOMER_SELECT = `
  id, name, phone, whatsapp_phone, email, status, preferred_channel,
  tags, notes, marketing_opt_in, profile_id, created_at
`;

const ORDER_SELECT = `
  id, order_number, status, channel, occasion, event_date, created_at,
  customer_id, customer:customers (id, name, phone, email)
`;

const EMPTY_STATS: CustomerStats = {
  orderCount: 0,
  lastOrderAt: null,
  nextEventDate: null,
};

const mapCustomerRow = (row: any, stats: CustomerStats = EMPTY_STATS): Customer => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  whatsappPhone: row.whatsapp_phone ?? null,
  email: row.email ?? null,
  status: row.status,
  preferredChannel: row.preferred_channel,
  tags: row.tags ?? [],
  notes: row.notes ?? null,
  marketingOptIn: row.marketing_opt_in ?? false,
  profileId: row.profile_id ?? null,
  createdAt: row.created_at,
  stats,
});

export const mapAddress = (row: any): CustomerAddress => ({
  id: row.id,
  customerId: row.customer_id,
  label: row.label,
  recipientName: row.recipient_name ?? null,
  phone: row.phone ?? null,
  line1: row.line1,
  line2: row.line2 ?? null,
  suburb: row.suburb ?? null,
  city: row.city ?? null,
  province: row.province ?? null,
  postalCode: row.postal_code ?? null,
  country: row.country,
  deliveryNotes: row.delivery_notes ?? null,
  isDefault: row.is_default,
});

export const mapNote = (row: any): CustomerNote => ({
  id: row.id,
  customerId: row.customer_id,
  body: row.body,
  createdAt: row.created_at,
});

/**
 * Order aggregates are always derived, never stored, so lifetime value and
 * order counts can never drift from the orders table.
 */
function buildStats(orders: any[]): Map<string, CustomerStats> {
  const today = new Date().toISOString().slice(0, 10);
  const map = new Map<string, CustomerStats>();
  for (const order of orders) {
    const current = map.get(order.customer_id) ?? { ...EMPTY_STATS };
    current.orderCount += 1;
    if (!current.lastOrderAt || order.created_at > current.lastOrderAt) {
      current.lastOrderAt = order.created_at;
    }
    const upcoming =
      order.event_date &&
      order.event_date >= today &&
      !["cancelled", "completed"].includes(order.status);
    if (upcoming && (!current.nextEventDate || order.event_date < current.nextEventDate)) {
      current.nextEventDate = order.event_date;
    }
    map.set(order.customer_id, current);
  }
  return map;
}

const toDbCustomer = (values: Partial<CustomerInput>) => ({
  ...(values.name !== undefined ? { name: values.name } : {}),
  ...(values.phone !== undefined ? { phone: values.phone } : {}),
  ...(values.whatsappPhone !== undefined
    ? { whatsapp_phone: values.whatsappPhone || null }
    : {}),
  ...(values.email !== undefined ? { email: values.email || null } : {}),
  ...(values.status !== undefined ? { status: values.status } : {}),
  ...(values.preferredChannel !== undefined
    ? { preferred_channel: values.preferredChannel }
    : {}),
  ...(values.tags !== undefined ? { tags: values.tags } : {}),
  ...(values.notes !== undefined ? { notes: values.notes || null } : {}),
  ...(values.marketingOptIn !== undefined
    ? { marketing_opt_in: values.marketingOptIn }
    : {}),
});

const toDbAddress = (values: Partial<AddressInput>) => ({
  ...(values.customerId !== undefined ? { customer_id: values.customerId } : {}),
  ...(values.label !== undefined ? { label: values.label } : {}),
  ...(values.recipientName !== undefined
    ? { recipient_name: values.recipientName || null }
    : {}),
  ...(values.phone !== undefined ? { phone: values.phone || null } : {}),
  ...(values.line1 !== undefined ? { line1: values.line1 } : {}),
  ...(values.line2 !== undefined ? { line2: values.line2 || null } : {}),
  ...(values.suburb !== undefined ? { suburb: values.suburb || null } : {}),
  ...(values.city !== undefined ? { city: values.city || null } : {}),
  ...(values.province !== undefined ? { province: values.province || null } : {}),
  ...(values.postalCode !== undefined ? { postal_code: values.postalCode || null } : {}),
  ...(values.country !== undefined ? { country: values.country } : {}),
  ...(values.deliveryNotes !== undefined
    ? { delivery_notes: values.deliveryNotes || null }
    : {}),
  ...(values.isDefault !== undefined ? { is_default: values.isDefault } : {}),
});

/* ---------------------------------- reads --------------------------------- */

export async function fetchCustomers(
  supabase: Client,
  filters: ListCustomersInput,
): Promise<Customer[]> {
  let query = supabase
    .from("customers")
    .select(CUSTOMER_SELECT)
    .order("created_at", { ascending: false })
    .limit(filters.limit);

  if (filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.tag) query = query.contains("tags", [filters.tag]);

  const [{ data, error }, { data: orders, error: ordersError }] = await Promise.all([
    query,
    supabase.from("orders").select("customer_id, created_at, event_date, status"),
  ]);
  if (error) throw new Error(error.message);
  if (ordersError) throw new Error(ordersError.message);

  const stats = buildStats(orders ?? []);
  let rows = (data ?? []).map((row: any) =>
    mapCustomerRow(row, stats.get(row.id) ?? { ...EMPTY_STATS }),
  );

  const search = filters.search?.trim().toLowerCase();
  if (search) {
    rows = rows.filter((row) =>
      [row.name, row.phone, row.whatsappPhone, row.email, ...row.tags]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search)),
    );
  }

  const sorters: Record<string, (a: Customer, b: Customer) => number> = {
    recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
    name: (a, b) => a.name.localeCompare(b.name),
    orders: (a, b) => b.stats.orderCount - a.stats.orderCount,
    last_order: (a, b) => (b.stats.lastOrderAt ?? "").localeCompare(a.stats.lastOrderAt ?? ""),
  };
  return rows.sort(sorters[filters.sort] ?? sorters.recent);
}

export async function fetchCustomerDetail(
  supabase: Client,
  customerId: string,
): Promise<CustomerDetail> {
  const [customerRes, addressRes, noteRes, orderRes] = await Promise.all([
    supabase.from("customers").select(CUSTOMER_SELECT).eq("id", customerId).maybeSingle(),
    supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", customerId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("customer_notes")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
  ]);

  if (customerRes.error) throw new Error(customerRes.error.message);
  if (!customerRes.data) throw new Error("Customer not found");
  if (addressRes.error) throw new Error(addressRes.error.message);
  if (noteRes.error) throw new Error(noteRes.error.message);
  if (orderRes.error) throw new Error(orderRes.error.message);

  const orders = (orderRes.data ?? []) as any[];
  const stats = buildStats(orders).get(customerId) ?? { ...EMPTY_STATS };

  return {
    ...mapCustomerRow(customerRes.data, stats),
    addresses: (addressRes.data ?? []).map(mapAddress),
    noteEntries: (noteRes.data ?? []).map(mapNote),
    orders: orders.map(mapOrderListItem) as OrderListItem[],
  };
}

/** Distinct tags across the book — powers the tag filter and suggestions. */
export async function fetchCustomerTags(supabase: Client): Promise<string[]> {
  const { data, error } = await supabase.from("customers").select("tags");
  if (error) throw new Error(error.message);
  const set = new Set<string>();
  for (const row of (data ?? []) as any[]) for (const tag of row.tags ?? []) set.add(tag);
  return [...set].sort((a, b) => a.localeCompare(b));
}

/* --------------------------------- writes --------------------------------- */

export async function insertCustomer(supabase: Client, input: CustomerInput) {
  const { data, error } = await supabase
    .from("customers")
    .insert(toDbCustomer(input) as any)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function updateCustomerRow(
  supabase: Client,
  id: string,
  values: Partial<CustomerInput>,
) {
  const { error } = await supabase
    .from("customers")
    .update(toDbCustomer(values) as any)
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { id };
}

async function clearDefaultAddress(supabase: Client, customerId: string, keepId?: string) {
  let query = supabase
    .from("customer_addresses")
    .update({ is_default: false } as any)
    .eq("customer_id", customerId);
  if (keepId) query = query.neq("id", keepId);
  const { error } = await query;
  if (error) throw new Error(error.message);
}

export async function insertAddress(supabase: Client, input: AddressInput) {
  const { data, error } = await supabase
    .from("customer_addresses")
    .insert(toDbAddress(input) as any)
    .select("id, customer_id, is_default")
    .single();
  if (error) throw new Error(error.message);
  if (input.isDefault) await clearDefaultAddress(supabase, input.customerId, data.id);
  return { id: data.id };
}

export async function updateAddressRow(
  supabase: Client,
  id: string,
  values: Partial<AddressInput>,
) {
  const { data, error } = await supabase
    .from("customer_addresses")
    .update(toDbAddress(values) as any)
    .eq("id", id)
    .select("customer_id")
    .single();
  if (error) throw new Error(error.message);
  if (values.isDefault) await clearDefaultAddress(supabase, data.customer_id, id);
  return { id };
}

export async function insertNote(supabase: Client, customerId: string, body: string) {
  const { error } = await supabase
    .from("customer_notes")
    .insert({ customer_id: customerId, body } as any);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteRow(
  supabase: Client,
  table: "customers" | "customer_addresses" | "customer_notes",
  id: string,
) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { id };
}
