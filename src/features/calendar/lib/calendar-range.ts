import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { CalendarView } from "../types";

const WEEK_OPTIONS = { weekStartsOn: 1 } as const; // Monday-first (SA convention)

export const toKey = (date: Date | string) =>
  typeof date === "string" ? date.slice(0, 10) : format(date, "yyyy-MM-dd");

/** Inclusive date range that a view needs to fetch. */
export function viewRange(view: CalendarView, anchor: Date) {
  if (view === "day") return { start: startOfDay(anchor), end: startOfDay(anchor) };
  if (view === "week")
    return {
      start: startOfWeek(anchor, WEEK_OPTIONS),
      end: endOfWeek(anchor, WEEK_OPTIONS),
    };
  return {
    start: startOfWeek(startOfMonth(anchor), WEEK_OPTIONS),
    end: endOfWeek(endOfMonth(anchor), WEEK_OPTIONS),
  };
}

/** Every day rendered by a view, as Date objects. */
export function viewDays(view: CalendarView, anchor: Date): Date[] {
  const { start, end } = viewRange(view, anchor);
  const days: Date[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) days.push(day);
  return days;
}

export function shiftAnchor(view: CalendarView, anchor: Date, direction: 1 | -1) {
  if (view === "day") return addDays(anchor, direction);
  if (view === "week") return addWeeks(anchor, direction);
  return addMonths(anchor, direction);
}

export function viewTitle(view: CalendarView, anchor: Date) {
  if (view === "day") return format(anchor, "EEEE d MMMM yyyy");
  if (view === "week") {
    const { start, end } = viewRange("week", anchor);
    return `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`;
  }
  return format(anchor, "MMMM yyyy");
}

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** 0 = Sunday, matching Postgres `EXTRACT(DOW)`. */
export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
