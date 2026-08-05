import { format, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarEntryPill } from "./CalendarEntryPill";
import { DayWorkload } from "./DayWorkload";
import { toKey, WEEKDAY_LABELS } from "../lib/calendar-range";
import type { DaySummary } from "../lib/day-index";

/** Month grid. Presentational only — all data arrives pre-bucketed. */
export function MonthView({
  days,
  anchor,
  dayIndex,
  onSelectDay,
  onSelectEvent,
}: {
  days: Date[];
  anchor: Date;
  dayIndex: Map<string, DaySummary>;
  onSelectDay: (date: Date) => void;
  onSelectEvent: (eventId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="grid grid-cols-7 border-b border-border/70 bg-muted/40">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = toKey(day);
          const summary = dayIndex.get(key);
          const outside = !isSameMonth(day, anchor);
          const blocked = summary?.availability?.isBlocked;

          return (
            <div
              key={key}
              className={cn(
                "min-h-[104px] border-b border-r border-border/50 p-1.5 last:border-r-0",
                outside && "bg-muted/30",
                blocked && "bg-destructive/5",
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                className="flex w-full items-center justify-between text-left"
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday(day) && "bg-primary text-primary-foreground",
                    outside && "text-muted-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
                {blocked && (
                  <span className="text-[10px] font-medium text-destructive">Closed</span>
                )}
              </button>

              <div className="mt-1 space-y-1">
                {summary?.entries.slice(0, 3).map((entry) => (
                  <CalendarEntryPill
                    key={entry.id}
                    entry={entry}
                    onSelectEvent={onSelectEvent}
                  />
                ))}
                {summary && summary.entries.length > 3 && (
                  <p className="px-1 text-[10px] text-muted-foreground">
                    +{summary.entries.length - 3} more
                  </p>
                )}
              </div>

              {summary?.availability && (
                <DayWorkload
                  availability={summary.availability}
                  className="mt-2"
                  showLabel={false}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
