import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { getStatusMeta } from "@/features/orders/lib/status";
import { getEventTypeMeta } from "../lib/event-meta";
import type { CalendarEntry } from "../types";

/**
 * One compact row inside a day cell. Order entries link straight through to
 * the order detail screen; manual events open the edit handler.
 */
export function CalendarEntryPill({
  entry,
  onSelectEvent,
  showTime = false,
}: {
  entry: CalendarEntry;
  onSelectEvent?: (entryId: string) => void;
  showTime?: boolean;
}) {
  const base =
    "block w-full truncate rounded-md border px-2 py-1 text-left text-[11px] leading-tight transition-colors hover:opacity-90";

  if (entry.kind === "order") {
    const meta = getStatusMeta(entry.order.status);
    return (
      <Link
        to="/admin/orders/$orderId"
        params={{ orderId: entry.order.orderId }}
        className={cn(base, meta.className)}
        title={`${entry.order.orderNumber} — ${entry.order.customerName ?? "Customer"}`}
      >
        {entry.order.orderNumber} · {entry.order.customerName ?? "Customer"}
      </Link>
    );
  }

  const meta = getEventTypeMeta(entry.event.eventType);
  const time =
    showTime && !entry.event.allDay
      ? `${format(parseISO(entry.event.startAt), "HH:mm")} · `
      : "";

  return (
    <button
      type="button"
      onClick={() => onSelectEvent?.(entry.event.id)}
      className={cn(base, meta.className)}
      title={entry.event.title}
    >
      {time}
      {entry.event.title}
    </button>
  );
}
