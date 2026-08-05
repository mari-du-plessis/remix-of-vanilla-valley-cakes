import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  availabilityBlockInputSchema,
  calendarEventInputSchema,
  capacitySettingInputSchema,
  dateRangeSchema,
  idSchema,
  updateCalendarEventSchema,
  updateCapacitySettingSchema,
} from "./schema";
import {
  deleteRow,
  fetchAvailabilityBlocks,
  fetchCalendarEvents,
  fetchCapacitySettings,
  fetchDayAvailability,
  fetchOrderEvents,
  insertAvailabilityBlock,
  insertCalendarEvent,
  publicClient,
  updateCalendarEventRow,
  updateCapacitySettingRow,
  upsertCapacitySetting,
} from "./calendar.server";
import type { CalendarRangeData, DayAvailability } from "../types";

/** Admin: everything needed to render one visible calendar range. */
export const getCalendarRange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => dateRangeSchema.parse(data))
  .handler(async ({ data, context }): Promise<CalendarRangeData> => {
    const { supabase } = context;
    const [events, orders, blocks, availability] = await Promise.all([
      fetchCalendarEvents(supabase, data.from, data.to),
      fetchOrderEvents(supabase, data.from, data.to),
      fetchAvailabilityBlocks(supabase, data.from, data.to),
      fetchDayAvailability(supabase, data.from, data.to),
    ]);
    return { events, orders, blocks, availability };
  });

/**
 * Public: aggregated day availability. Deliberately privacy-safe — counts and
 * flags only, never customer or order details. This is the single integration
 * point the customer order form uses to gate dates.
 */
export const getDayAvailability = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => dateRangeSchema.parse(data))
  .handler(async ({ data }): Promise<DayAvailability[]> =>
    fetchDayAvailability(publicClient(), data.from, data.to),
  );

export const createCalendarEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => calendarEventInputSchema.parse(data))
  .handler(async ({ data, context }) =>
    insertCalendarEvent(context.supabase, data, context.userId),
  );

export const updateCalendarEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateCalendarEventSchema.parse(data))
  .handler(async ({ data, context }) =>
    updateCalendarEventRow(context.supabase, data.id, data.values),
  );

export const deleteCalendarEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) =>
    deleteRow(context.supabase, "calendar_events", data.id),
  );

export const createAvailabilityBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => availabilityBlockInputSchema.parse(data))
  .handler(async ({ data, context }) =>
    insertAvailabilityBlock(context.supabase, data, context.userId),
  );

export const deleteAvailabilityBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) =>
    deleteRow(context.supabase, "availability_blocks", data.id),
  );

export const listCapacitySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => fetchCapacitySettings(context.supabase));

export const createCapacitySetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => capacitySettingInputSchema.parse(data))
  .handler(async ({ data, context }) => upsertCapacitySetting(context.supabase, data));

export const updateCapacitySetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateCapacitySettingSchema.parse(data))
  .handler(async ({ data, context }) =>
    updateCapacitySettingRow(context.supabase, data.id, data.values),
  );

export const deleteCapacitySetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) =>
    deleteRow(context.supabase, "capacity_settings", data.id),
  );
