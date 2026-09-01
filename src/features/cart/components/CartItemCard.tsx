import { Link } from "@tanstack/react-router";
import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/common/Typography";
import type { ServingSize } from "@/features/cake-builder/lib/servings";
import { cartItemLines } from "../lib/summary";
import type { CartItem } from "../types";

/**
 * One product in the basket: what it is, how it was configured, and the two
 * actions the bakery asked for — edit it or take it out. Nothing here knows
 * about a specific product type; the summary builder handles that.
 */
export function CartItemCard({
  item,
  chart,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  chart: ServingSize[];
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const lines = cartItemLines(item, chart);

  return (
    <article className="surface-card rounded-2xl p-5 shadow-[var(--shadow-soft)] transition-shadow">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base">{item.label}</h3>
          <Muted className="mt-1 text-xs">
            {lines.length ? `${lines.length} details captured` : "No extra details"}
          </Muted>
        </div>
        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-label={`Edit ${item.label}`}
          >
            <Link to="/order" search={{ item: item.id }}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive"
            aria-label={`Remove ${item.label}`}
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {lines.length > 0 && (
        <dl className="mt-4 space-y-1.5 border-t border-border/60 pt-4 text-sm">
          {lines.map((line) => (
            <div key={`${line.label}-${line.value}`} className="flex gap-3">
              <dt className="w-40 shrink-0 text-xs tracking-wide text-muted-foreground uppercase">
                {line.label}
              </dt>
              <dd className="flex-1 leading-relaxed">{line.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <footer className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
        <span className="text-xs tracking-wide text-muted-foreground uppercase">Quantity</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-label="Decrease quantity"
            disabled={item.quantity <= 1}
            onClick={() => onQuantityChange(item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-label="Increase quantity"
            onClick={() => onQuantityChange(item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </article>
  );
}
