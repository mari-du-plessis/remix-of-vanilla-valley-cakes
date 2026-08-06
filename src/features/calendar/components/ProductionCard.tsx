import { useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { CakeSlice, Clock, MoreVertical, Truck, Users, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { getEventTypeMeta } from "../lib/event-meta";
import type { CalendarEntry } from "../types";

const EVENT_ICONS = {
  production: CakeSlice,
  collection: Package,
  delivery: Truck,
  consultation: Users,
  other: Clock,
} as const;

/**
 * Horizontal production card used by the week schedule. Orders link through to
 * the order detail screen; manual events open the edit dialog.
 */
export function ProductionCard({
  entry,
  onEditEvent,
  onDeleteEvent,
}: {
  entry: CalendarEntry;
  onEditEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
}) {
  const navigate = useNavigate();

  const isOrder = entry.kind === "order";
  const typeMeta = isOrder ? null : getEventTypeMeta(entry.event.eventType);
  const Icon = isOrder ? CakeSlice : EVENT_ICONS[entry.event.eventType];

  const title = isOrder ? entry.order.orderNumber : entry.event.title;
  const subtitle = isOrder
    ? (entry.order.customerName ?? "Customer")
    : (entry.event.location ?? "Vanilla Valley");
  const summary = isOrder
    ? (entry.order.occasion ?? "Custom cake")
    : (entry.event.notes ?? typeMeta?.label);
  const time =
    !isOrder && !entry.event.allDay
      ? format(parseISO(entry.event.startAt), "HH:mm")
      : null;

  const open = () => {
    if (isOrder) {
      void navigate({
        to: "/admin/orders/$orderId",
        params: { orderId: entry.order.orderId },
      });
    } else {
      onEditEvent?.(entry.event.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
      className="group flex min-w-0 flex-1 basis-[300px] cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/50"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            {summary && (
              <p className="truncate text-xs text-muted-foreground">{summary}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Quick actions"
                onClick={(event) => event.stopPropagation()}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(event) => event.stopPropagation()}
            >
              {isOrder ? (
                <DropdownMenuItem onSelect={open}>Open order</DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onSelect={() => onEditEvent?.(entry.event.id)}>
                    Edit event
                  </DropdownMenuItem>
                  {onDeleteEvent && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={() => onDeleteEvent(entry.event.id)}
                    >
                      Delete event
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {typeMeta && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                typeMeta.className,
              )}
            >
              {typeMeta.label}
            </span>
          )}
          {isOrder && <OrderStatusBadge status={entry.order.status} />}
          {time && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {time}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
