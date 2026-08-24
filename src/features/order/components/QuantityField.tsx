import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuantityRule } from "../flows/product-requirements";

/**
 * Quantity stepper for product families ordered by amount (dozens, packs…).
 * The unit and limits come from the family's requirements, never hard-coded
 * inside the UI.
 */
export function QuantityField({
  rule,
  value,
  onChange,
}: {
  rule: QuantityRule;
  value: number;
  onChange: (value: number) => void;
}) {
  const clamp = (next: number) => Math.min(rule.max, Math.max(rule.min, next));

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">How many?</p>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          aria-label="Decrease quantity"
          disabled={value <= rule.min}
          onClick={() => onChange(clamp(value - rule.step))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="min-w-24 text-center">
          <span className="text-2xl">{value}</span>{" "}
          <span className="text-sm text-muted-foreground">{value === 1 ? (rule.unitOne ?? rule.unit) : rule.unit}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          aria-label="Increase quantity"
          disabled={value >= rule.max}
          onClick={() => onChange(clamp(value + rule.step))}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {rule.hint && <p className="text-xs text-muted-foreground">{rule.hint}</p>}
    </div>
  );
}
