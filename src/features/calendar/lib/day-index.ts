import type {
  CalendarEntry,
  CalendarRangeData,
  DayAvailability,
} from "../types";
import { toKey } from "./calendar-range";

export type DaySummary = {
  key: string;
  entries: CalendarEntry[];
  orderCount: number;
  availability?: DayAvailability;
};

/**
 * Pure projection: range data -> per-day buckets keyed by YYYY-MM-DD.
 * Kept pure so the month, week and day views all read from one model.
 */
export function buildDayIndex(data: CalendarRangeData | undefined) {
  const index = new Map<string, DaySummary>();
  const ensure = (key: string) => {
    let day = index.get(key);
    if (!day) {
      day = { key, entries: [], orderCount: 0 };
      index.set(key, day);
    }
    return day;
  };

  data?.orders.forEach((order) => {
    const key = toKey(order.eventDate);
    const day = ensure(key);
    day.entries.push({ kind: "order", id: order.id, date: key, order });
    day.orderCount += 1;
  });

  data?.events.forEach((event) => {
    const key = toKey(event.startAt);
    ensure(key).entries.push({ kind: "event", id: event.id, date: key, event });
  });

  data?.availability.forEach((availability) => {
    ensure(toKey(availability.day)).availability = availability;
  });

  return index;
}

/** Workload as a 0–1 ratio, for the day-cell load indicator. */
export const workloadRatio = (availability?: DayAvailability) =>
  availability && availability.maxOrders > 0
    ? Math.min(availability.orderCount / availability.maxOrders, 1)
    : 0;
