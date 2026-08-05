import { cn } from "@/lib/utils";
import { workloadRatio } from "../lib/day-index";
import type { DayAvailability } from "../types";

/** Small workload meter: booked vs. configured capacity for a single day. */
export function DayWorkload({
  availability,
  className,
  showLabel = true,
}: {
  availability?: DayAvailability;
  className?: string;
  showLabel?: boolean;
}) {
  if (!availability) return null;
  const ratio = workloadRatio(availability);
  const full = availability.orderCount >= availability.maxOrders;

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <p
          className={cn(
            "text-[10px] font-medium",
            full ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {availability.orderCount}/{availability.maxOrders} cakes
        </p>
      )}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            full ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}
