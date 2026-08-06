import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/common";
import { formatCents } from "@/features/pricing/lib/money";
import { formatOrderDate } from "@/features/orders/lib/format";
import { QuoteStatusBadge } from "./QuoteStatusBadge";
import type { QuoteListItem } from "../types";

/** Shared quote list — used by the quotes hub and the order detail panel. */
export function QuoteList({
  quotes,
  emptyMessage = "No quotes yet.",
  compact = false,
}: {
  quotes: QuoteListItem[];
  emptyMessage?: string;
  compact?: boolean;
}) {
  if (quotes.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <ul className="space-y-2">
      {quotes.map((quote) => (
        <li key={quote.id}>
          <Link
            to="/admin/quotes/$quoteId"
            params={{ quoteId: quote.id }}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{quote.quoteNumber}</span>
                {quote.revision > 1 && (
                  <span className="text-xs text-muted-foreground">rev {quote.revision}</span>
                )}
              </p>
              {!compact && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {[
                    quote.customerName,
                    quote.orderNumber,
                    quote.eventDate ? formatOrderDate(quote.eventDate) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-medium">
                {formatCents(quote.totalCents, quote.currency)}
              </span>
              <QuoteStatusBadge status={quote.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
