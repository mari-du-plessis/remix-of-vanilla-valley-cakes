import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { EmptyState, LoadingState } from "@/components/common";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { formatCents } from "@/features/pricing/lib/money";
import { QuoteList } from "@/features/quotes/components/QuoteList";
import { useQuotes } from "@/features/quotes/hooks/useQuotes";
import { QUOTE_STATUS_FLOW, QUOTE_STATUS_LABELS } from "@/features/quotes/types";
import type { QuoteStatus } from "@/features/quotes/types";
import { cn } from "@/lib/utils";

const FILTERS: { value: QuoteStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...QUOTE_STATUS_FLOW.map((status) => ({ value: status, label: QUOTE_STATUS_LABELS[status] })),
];

/** Admin hub: every quotation across all orders. */
export function QuotesManager() {
  const [status, setStatus] = useState<QuoteStatus | "all">("all");
  const [search, setSearch] = useState("");
  const { data: quotes, isPending, error } = useQuotes(status, search);

  const outstanding = useMemo(
    () =>
      (quotes ?? [])
        .filter((quote) => ["finalised", "sent"].includes(quote.status))
        .reduce((total, quote) => total + quote.totalCents, 0),
    [quotes],
  );

  return (
    <>
      <AdminPageHeader
        title="Quotes"
        description="Generate, edit and send quotations. Prices stay internal until you share the PDF."
      />

      <div className="mt-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  status === filter.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search quote, order or customer"
            className="sm:max-w-xs"
          />
        </div>

        {outstanding > 0 && (
          <p className="text-sm text-muted-foreground">
            Awaiting a decision:{" "}
            <span className="font-medium text-foreground">{formatCents(outstanding)}</span>
          </p>
        )}

        {isPending ? (
          <LoadingState label="Loading quotes…" />
        ) : error ? (
          <EmptyState message={`Could not load quotes — ${error.message}`} />
        ) : (
          <QuoteList quotes={quotes ?? []} emptyMessage="No quotes match this filter yet." />
        )}
      </div>
    </>
  );
}
