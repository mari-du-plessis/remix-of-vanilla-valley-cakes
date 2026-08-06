import type { DayAvailability } from "../types";
import { workloadRatio } from "./day-index";

export type WorkloadLevel =
  | "available"
  | "busy"
  | "nearly_full"
  | "fully_booked"
  | "closed";

export type WorkloadMeta = {
  level: WorkloadLevel;
  label: string;
  /** Dot / bar fill colour. */
  fillClassName: string;
  /** Text colour for the status label. */
  textClassName: string;
};

const META: Record<WorkloadLevel, WorkloadMeta> = {
  available: {
    level: "available",
    label: "Available",
    fillClassName: "bg-status-available",
    textClassName: "text-status-available",
  },
  busy: {
    level: "busy",
    label: "Busy",
    fillClassName: "bg-status-busy",
    textClassName: "text-status-busy",
  },
  nearly_full: {
    level: "nearly_full",
    label: "Nearly full",
    fillClassName: "bg-status-nearly-full",
    textClassName: "text-status-nearly-full",
  },
  fully_booked: {
    level: "fully_booked",
    label: "Fully booked",
    fillClassName: "bg-status-full",
    textClassName: "text-status-full",
  },
  closed: {
    level: "closed",
    label: "Closed",
    fillClassName: "bg-status-closed",
    textClassName: "text-status-closed",
  },
};

/**
 * Presentation-only mapping from a day's availability aggregate to a workload
 * signal. No business rules live here — the thresholds only drive colour.
 */
export function getWorkloadMeta(availability?: DayAvailability): WorkloadMeta {
  if (!availability) return META.available;
  if (availability.isBlocked) return META.closed;

  const ratio = workloadRatio(availability);
  if (availability.maxOrders > 0 && availability.orderCount >= availability.maxOrders)
    return META.fully_booked;
  if (ratio >= 0.7) return META.nearly_full;
  if (ratio > 0) return META.busy;
  return META.available;
}

export const CAPACITY_FOOTNOTE = "Capacity values are based on cakes per day.";
