import { Link } from "@tanstack/react-router";
import { CalendarDays, Phone } from "lucide-react";
import { formatOrderDate } from "../lib/format";
import { ORDER_CHANNEL_LABELS } from "../lib/status";
import { OrderStatusBadge } from "./OrderStatusBadge";
import type { OrderListItem } from "../types";

/** Compact, mobile-first summary of one order. */
export function OrderCard({ order }: { order: OrderListItem }) {
  return (
    <Link
      to="/admin/orders/$orderId"
      params={{ orderId: order.id }}
      className="block rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {order.customer?.name ?? "Unknown customer"}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.orderNumber} · {ORDER_CHANNEL_LABELS[order.channel]}
            {order.occasion ? ` · ${order.occasion}` : ""}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {order.customer?.phone && (
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3 w-3" /> {order.customer.phone}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          {order.eventDate ? formatOrderDate(order.eventDate) : "No event date"}
        </span>
      </div>
    </Link>
  );
}
