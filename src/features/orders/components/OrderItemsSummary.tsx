import type { OrderItem } from "../types";

/** Read-only breakdown of what the customer configured. */
export function OrderItemsSummary({ items }: { items: OrderItem[] }) {
  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">No line items recorded.</p>;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-border p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.sizeLabel ? `${item.sizeLabel} · ` : ""}Qty {item.quantity}
            </p>
          </div>
          {item.options.length > 0 && (
            <dl className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
              {item.options.map((option) => (
                <div key={option.id} className="flex justify-between gap-3 text-sm">
                  <dt className="text-muted-foreground">{option.groupLabel}</dt>
                  <dd className="text-right">{option.valueLabel}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ))}
    </div>
  );
}
