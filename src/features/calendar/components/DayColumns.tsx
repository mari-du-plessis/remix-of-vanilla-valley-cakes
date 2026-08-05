import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common";
import { CalendarEntryPill } from "./CalendarEntryPill";
import { DayWorkload } from "./DayWorkload";
import { toKey } from "../lib/calendar-range";
import type { DaySummary } from "../lib/day-index";

/** Week and day views share one column renderer — a day view is a 1-column week. */
export function DayColumns({
  days,
  dayIndex,
  onSelectDay,
  onSelectEvent,
}: {
  days: Date[];
  dayIndex: Map<string, DaySummary>;
  onSelectDay: (date: Date) => void;
  onSelectEvent: (eventId: string) => void;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        days.length > 1 ? "sm:grid-cols-2 lg:grid-cols-7" : "grid-cols-1",
      )}
    >
      {days.map((day) => {
        const key = toKey(day);
        const summary = dayIndex.get(key);
        const blocked = summary?.availability?.isBlocked;

        return (
          <div
            key={key}
            className={cn(
              "rounded-2xl border border-border/70 bg-card p-3 shadow-[var(--shadow-soft)]",
              blocked && "border-destructive/40 bg-destructive/5",
            )}
          >
            <button
              type="button"
              onClick={() => onSelectDay(day)}
              className="flex w-full items-baseline justify-between text-left"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {format(day, "EEE")}
              </span>
              <span
                className={cn(
                  "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold",
                  isToday(day) && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d MMM")}
              </span>
            </button>

            <div className="mt-3 space-y-1.5">
              {summary?.entries.length ? (
                summary.entries.map((entry) => (
                  <CalendarEntryPill
                    key={entry.id}
                    entry={entry}
                    onSelectEvent={onSelectEvent}
                    showTime
                  />
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Nothing scheduled</p>
              )}
            </div>

            {blocked && (
              <p className="mt-3 text-[11px] font-medium text-destructive">
                {summary?.availability?.blockReason || "Closed"}
              </p>
            )}
            <DayWorkload availability={summary?.availability} className="mt-3" />
          </div>
        );
      })}
      {days.length === 0 && <EmptyState message="No days in this range." />}
    </div>
  );
}
