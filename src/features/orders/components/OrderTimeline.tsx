import { formatOrderDateTime } from "../lib/format";
import { getStatusMeta } from "../lib/status";
import type { OrderStatusEvent } from "../types";

/** Audit trail of every lifecycle transition. */
export function OrderTimeline({ history }: { history: OrderStatusEvent[] }) {
  if (history.length === 0)
    return <p className="text-sm text-muted-foreground">No status changes yet.</p>;

  return (
    <ol className="space-y-3">
      {history.map((event) => (
        <li key={event.id} className="flex gap-3 text-sm">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          <div>
            <p>
              {event.fromStatus
                ? `${getStatusMeta(event.fromStatus).label} → ${getStatusMeta(event.toStatus).label}`
                : `Created as ${getStatusMeta(event.toStatus).label}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatOrderDateTime(event.createdAt)}
              {event.note ? ` · ${event.note}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
