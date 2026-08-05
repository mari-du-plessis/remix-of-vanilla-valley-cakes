import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type {
  AvailabilityBlock,
  CalendarEvent,
  CalendarOrderEvent,
  CapacitySetting,
  DayAvailability,
} from "../types";
import type {
  AvailabilityBlockInput,
  CalendarEventInput,
  CapacitySettingInput,
} from "./schema";

type Client = SupabaseClient<Database>;

/* eslint-disable @typescript-eslint/no-explicit-any */

export const mapEvent = (row: any): CalendarEvent => ({
  id: row.id,
  orderId: row.order_id ?? null,
  eventType: row.event_type,
  title: row.title,
  notes: row.notes ?? null,
  location: row.location ?? null,
  startAt: row.start_at,
  endAt: row.end_at ?? null,
  allDay: row.all_day,
});

export const mapOrderEvent = (row: any): CalendarOrderEvent => ({
  id: `order-${row.id}`,
  orderId: row.id,
  orderNumber: row.order_number,
  status: row.status,
  occasion: row.occasion ?? null,
  customerName: row.customer?.name ?? null,
  eventDate: row.event_date,
});

export const mapBlock = (row: any): AvailabilityBlock => ({
  id: row.id,
  startDate: row.start_date,
  endDate: row.end_date,
  blockType: row.block_type,
  reason: row.reason ?? null,
});

export const mapCapacity = (row: any): CapacitySetting => ({
  id: row.id,
  weekday: row.weekday ?? null,
  maxOrdersPerDay: row.max_orders_per_day,
  maxServingsPerDay: row.max_servings_per_day ?? null,
  leadTimeDays: row.lead_time_days,
  isActive: row.is_active,
  notes: row.notes ?? null,
});

export const mapAvailability = (row: any): DayAvailability => ({
  day: row.day,
  orderCount: row.order_count,
  maxOrders: row.max_orders,
  leadTimeDays: row.lead_time_days,
  isBlocked: row.is_blocked,
  blockReason: row.block_reason ?? null,
  isAvailable: row.is_available,
});

/* eslint-enable @typescript-eslint/no-explicit-any */

const eventRow = (values: Partial<CalendarEventInput>) => {
  const row: Record<string, unknown> = {};
  if (values.orderId !== undefined) row.order_id = values.orderId || null;
  if (values.eventType !== undefined) row.event_type = values.eventType;
  if (values.title !== undefined) row.title = values.title;
  if (values.notes !== undefined) row.notes = values.notes || null;
  if (values.location !== undefined) row.location = values.location || null;
  if (values.startAt !== undefined) row.start_at = values.startAt;
  if (values.endAt !== undefined) row.end_at = values.endAt || null;
  if (values.allDay !== undefined) row.all_day = values.allDay;
  return row;
};

const capacityRow = (values: Partial<CapacitySettingInput>) => {
  const row: Record<string, unknown> = {};
  if (values.weekday !== undefined) row.weekday = values.weekday;
  if (values.maxOrdersPerDay !== undefined)
    row.max_orders_per_day = values.maxOrdersPerDay;
  if (values.maxServingsPerDay !== undefined)
    row.max_servings_per_day = values.maxServingsPerDay;
  if (values.leadTimeDays !== undefined) row.lead_time_days = values.leadTimeDays;
  if (values.isActive !== undefined) row.is_active = values.isActive;
  if (values.notes !== undefined) row.notes = values.notes || null;
  return row;
};

/** Server-side publishable client for public, RLS-scoped reads. */
export function publicClient(): Client {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
          headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/* ---------------------------------- reads --------------------------------- */

export async function fetchCalendarEvents(client: Client, from: string, to: string) {
  const { data, error } = await client
    .from("calendar_events")
    .select("id, order_id, event_type, title, notes, location, start_at, end_at, all_day")
    .gte("start_at", `${from}T00:00:00Z`)
    .lte("start_at", `${to}T23:59:59Z`)
    .order("start_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapEvent);
}

export async function fetchOrderEvents(client: Client, from: string, to: string) {
  const { data, error } = await client
    .from("orders")
    .select("id, order_number, status, occasion, event_date, customer:customers (name)")
    .gte("event_date", from)
    .lte("event_date", to)
    .not("event_date", "is", null)
    .order("event_date");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOrderEvent);
}

export async function fetchAvailabilityBlocks(client: Client, from: string, to: string) {
  const { data, error } = await client
    .from("availability_blocks")
    .select("id, start_date, end_date, block_type, reason")
    .lte("start_date", to)
    .gte("end_date", from)
    .order("start_date");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapBlock);
}

export async function fetchDayAvailability(client: Client, from: string, to: string) {
  const { data, error } = await client.rpc("day_availability", { _from: from, _to: to });
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map(mapAvailability);
}

export async function fetchCapacitySettings(client: Client) {
  const { data, error } = await client
    .from("capacity_settings")
    .select("*")
    .order("weekday", { ascending: true, nullsFirst: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCapacity);
}

/* --------------------------------- writes --------------------------------- */

export async function insertCalendarEvent(
  client: Client,
  values: CalendarEventInput,
  createdBy: string,
) {
  const { data, error } = await client
    .from("calendar_events")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ ...(eventRow(values) as any), created_by: createdBy })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id };
}

export async function updateCalendarEventRow(
  client: Client,
  id: string,
  values: Partial<CalendarEventInput>,
) {
  const { error } = await client.from("calendar_events").update(eventRow(values) as never).eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function deleteRow(client: Client, table: "calendar_events" | "availability_blocks" | "capacity_settings", id: string) {
  const { error } = await client.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function insertAvailabilityBlock(
  client: Client,
  values: AvailabilityBlockInput,
  createdBy: string,
) {
  const { error } = await client.from("availability_blocks").insert({
    start_date: values.startDate,
    end_date: values.endDate,
    block_type: values.blockType ?? "closure",
    reason: values.reason || null,
    created_by: createdBy,
  });
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function upsertCapacitySetting(client: Client, values: CapacitySettingInput) {
  const { error } = await client
    .from("capacity_settings")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(capacityRow(values) as any);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function updateCapacitySettingRow(
  client: Client,
  id: string,
  values: Partial<CapacitySettingInput>,
) {
  const { error } = await client
    .from("capacity_settings")
    .update(capacityRow(values) as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true as const };
}
