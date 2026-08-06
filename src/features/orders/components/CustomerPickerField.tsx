import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import type { Customer } from "@/features/customers/types";

/**
 * Reusable "find an existing customer, or capture a new one" control.
 * Any future intake surface (WhatsApp import, walk-in till, quotations) can
 * reuse it instead of re-implementing customer search.
 */
export function CustomerPickerField({
  selected,
  onSelect,
}: {
  selected: Customer | null;
  onSelect: (customer: Customer | null) => void;
}) {
  const [search, setSearch] = useState("");
  const { data, isFetching } = useCustomers({ search, limit: 8 });

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{selected.name}</p>
          <p className="truncate text-xs text-muted-foreground">{selected.phone}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(null)}>
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        Find an existing customer
      </Label>
      <Input
        value={search}
        placeholder="Search by name, phone or email"
        onChange={(event) => setSearch(event.target.value)}
      />
      {search.trim().length > 1 && (
        <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
          {isFetching && !data ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>
          ) : (data?.length ?? 0) === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No match — capture the details below instead.
            </p>
          ) : (
            (data ?? []).map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => onSelect(customer)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <span className="truncate">{customer.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {customer.phone}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
