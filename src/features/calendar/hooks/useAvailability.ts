import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { addDays, format } from "date-fns";
import { getDayAvailability } from "../api/calendar.functions";
import { calendarKeys } from "./useCalendar";
import type { DayAvailability } from "../types";

const key = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Public availability window used by the customer order form.
 * Returns aggregated flags only (no order or customer data), so it is safe to
 * call from anonymous, unauthenticated pages.
 */
export function useAvailabilityWindow(days = 180, startDate = new Date()) {
  const from = key(startDate);
  const to = key(addDays(startDate, days));
  const fetchAvailability = useServerFn(getDayAvailability);

  const query = useQuery<DayAvailability[]>({
    queryKey: calendarKeys.availability(from, to),
    queryFn: () => fetchAvailability({ data: { from, to } }),
    staleTime: 5 * 60 * 1000,
  });

  const byDay = useMemo(() => {
    const map = new Map<string, DayAvailability>();
    query.data?.forEach((day) => map.set(day.day.slice(0, 10), day));
    return map;
  }, [query.data]);

  const leadTimeDays = query.data?.[0]?.leadTimeDays ?? 0;
  const minDate = key(addDays(startDate, leadTimeDays));

  return {
    ...query,
    byDay,
    leadTimeDays,
    /** Earliest bookable date, honouring the configured lead time. */
    minDate,
    /**
     * Availability check for a single YYYY-MM-DD value. Unknown dates return
     * `true` so the form never blocks a customer on a failed lookup.
     */
    isDateAvailable: (date: string) => byDay.get(date)?.isAvailable ?? true,
    getDay: (date: string) => byDay.get(date),
    unavailableReason: (date: string) => {
      const day = byDay.get(date);
      if (!day || day.isAvailable) return null;
      if (day.isBlocked) return day.blockReason || "We are closed on this date";
      if (day.orderCount >= day.maxOrders) return "Fully booked on this date";
      return `We need at least ${day.leadTimeDays} days' notice`;
    },
  };
}
