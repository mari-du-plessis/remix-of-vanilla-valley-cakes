import { format, isToday } from "date-fns";
import { CalendarOff, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CapacityMeter } from "./CapacityMeter";
import { ProductionCard } from "./ProductionCard";
import { toKey } from "../lib/calendar-range";
import { CAPACITY_FOOTNOTE } from "../lib/workload";
import type { DaySummary } from "../lib/day-index";

/**
 * Week production schedule: one full-width collapsible row per day,
 * Sunday → Saturday. Optimised for reading a whole week's workload at a
 * glance rather than for calendar-grid fidelity.
 */
export function WeekSchedule({
  days,
  dayIndex,
  expanded,
  onToggleDay,
  onSelectDay,
  onEditEvent,
  onDeleteEvent,
}: {
  days: Date[];
  dayIndex: Map<string, DaySummary>;
  expanded: Record<string, boolean>;
  onToggleDay: (key: string) => void;
  onSelectDay: (date: Date) => void;
  onEditEvent: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {days.map((day) => {
        const key = toKey(day);
        const summary = dayIndex.get(key);
        const entries = summary?.entries ?? [];
        const isOpen = expanded[key] ?? false;
        const blocked = summary?.availability?.isBlocked;

        return (
          <section
            key={key}
            className={cn(
              "overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-soft)]",
              blocked && "border-border bg-muted/40",
            )}
          >
            <button
              type="button"
              onClick={() => onToggleDay(key)}
              aria-expanded={isOpen}
              className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/40 sm:gap-5 sm:px-5"
            >
              <span className="flex w-14 shrink-0 flex-col items-center leading-tight sm:w-16">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {format(day, "EEE")}
                </span>
                <span
                  className={cn(
                    "text-2xl font-semibold tabular-nums",
                    isToday(day) && "text-primary",
                  )}
                >
                  {format(day, "d")}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {format(day, "MMM")}
                </span>
              </span>

              <span className="min-w-0">
                <CapacityMeter
                  availability={summary?.availability}
                  className="flex-wrap"
                />
                {blocked && summary?.availability?.blockReason && (
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {summary.availability.blockReason}
                  </span>
                )}
              </span>

              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen && (
              <div className="border-t border-border/60 bg-background/40 p-3 sm:p-4">
                {entries.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {entries.map((entry) => (
                      <ProductionCard
                        key={entry.id}
                        entry={entry}
                        onEditEvent={onEditEvent}
                        onDeleteEvent={onDeleteEvent}
                      />
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectDay(day)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <CalendarOff className="h-4 w-4" /> Nothing scheduled
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}

      <p className="pt-1 text-center text-xs text-muted-foreground">
        {CAPACITY_FOOTNOTE}
      </p>
    </div>
  );
}
