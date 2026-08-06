import { cn } from "@/lib/utils";
import { workloadRatio } from "../lib/day-index";
import { getWorkloadMeta } from "../lib/workload";
import type { DayAvailability } from "../types";

/**
 * Capacity readout for a day: "3 / 5 cakes", a progress bar and the
 * availability status. Presentation only.
 */
export function CapacityMeter({
  availability,
  className,
  barClassName,
}: {
  availability?: DayAvailability;
  className?: string;
  barClassName?: string;
}) {
  const meta = getWorkloadMeta(availability);
  const ratio = availability ? workloadRatio(availability) : 0;
  const booked = availability?.orderCount ?? 0;
  const max = availability?.maxOrders ?? 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-xs font-medium tabular-nums text-muted-foreground whitespace-nowrap">
        {booked} / {max || "—"} cakes
      </span>
      <div
        className={cn(
          "h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:w-32",
          barClassName,
        )}
        role="progressbar"
        aria-valuenow={booked}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn("h-full rounded-full transition-all", meta.fillClassName)}
          style={{ width: `${Math.max(Math.round(ratio * 100), booked > 0 ? 8 : 0)}%` }}
        />
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap",
          meta.textClassName,
        )}
      >
        <span className={cn("h-2 w-2 shrink-0 rounded-full", meta.fillClassName)} />
        {meta.label}
      </span>
    </div>
  );
}
