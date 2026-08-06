import { Link } from "@tanstack/react-router";
import { CalendarClock, MessageCircle, ShoppingBag } from "lucide-react";
import { formatOrderDate, formatOrderDateTime } from "@/features/orders/lib/format";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { CustomerTagList } from "./CustomerTagList";
import type { Customer } from "../types";

export function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <Link
      to="/admin/customers/$customerId"
      params={{ customerId: customer.id }}
      className="block rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{customer.name}</p>
          <p className="truncate text-sm text-muted-foreground">{customer.phone}</p>
          {customer.email && (
            <p className="truncate text-sm text-muted-foreground">{customer.email}</p>
          )}
        </div>
        <CustomerStatusBadge status={customer.status} />
      </div>

      <CustomerTagList tags={customer.tags} className="mt-3" />

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ShoppingBag className="h-3 w-3" />
          {customer.stats.orderCount} order{customer.stats.orderCount === 1 ? "" : "s"}
        </span>
        {customer.stats.lastOrderAt && (
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            Last {formatOrderDateTime(customer.stats.lastOrderAt)}
          </span>
        )}
        {customer.stats.nextEventDate && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            Next {formatOrderDate(customer.stats.nextEventDate)}
          </span>
        )}
      </div>
    </Link>
  );
}
