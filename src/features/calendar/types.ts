import type { Database } from "@/integrations/supabase/types";
import type { OrderStatus } from "@/features/orders/types";

export type CalendarEventType = Database["public"]["Enums"]["calendar_event_type"];
export type AvailabilityBlockType =
  Database["public"]["Enums"]["availability_block_type"];

export type CalendarView = "month" | "week" | "day";

/** A manually created (or order-linked) calendar entry. */
export type CalendarEvent = {
  id: string;
  orderId: string | null;
  eventType: CalendarEventType;
  title: string;
  notes: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
};

/** An order projected onto the calendar via its event date. */
export type CalendarOrderEvent = {
  id: string;
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  occasion: string | null;
  customerName: string | null;
  eventDate: string;
};

export type AvailabilityBlock = {
  id: string;
  startDate: string;
  endDate: string;
  blockType: AvailabilityBlockType;
  reason: string | null;
};

export type CapacitySetting = {
  id: string;
  /** null = the default rule applied to every weekday without an override. */
  weekday: number | null;
  maxOrdersPerDay: number;
  maxServingsPerDay: number | null;
  leadTimeDays: number;
  isActive: boolean;
  notes: string | null;
};

/** Aggregated, privacy-safe availability for a single day. */
export type DayAvailability = {
  day: string;
  orderCount: number;
  maxOrders: number;
  leadTimeDays: number;
  isBlocked: boolean;
  blockReason: string | null;
  isAvailable: boolean;
};

/** Everything the admin calendar needs for one visible range. */
export type CalendarRangeData = {
  events: CalendarEvent[];
  orders: CalendarOrderEvent[];
  blocks: AvailabilityBlock[];
  availability: DayAvailability[];
};

/** Union rendered inside a day cell. */
export type CalendarEntry =
  | { kind: "event"; id: string; date: string; event: CalendarEvent }
  | { kind: "order"; id: string; date: string; order: CalendarOrderEvent };
