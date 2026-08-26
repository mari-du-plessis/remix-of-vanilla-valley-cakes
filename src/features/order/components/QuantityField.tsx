import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuantityRule } from "../flows/product-requirements";

/**
 * Quantity stepper for product families ordered by amount (dozens, packs…).
 * The unit and limits come from the family's requirements, never hard-coded
 * inside the UI.
 *
 * Large tap targets for phones, a typed field for big numbers, and clamping on
 * every path so zero, negative and non-numeric amounts can't be submitted.
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
  const clamp = (next: number) =>
    Math.min(rule.max, Math.max(rule.min, Number.isFinite(next) ? Math.round(next) : rule.min));

  const unit = value === 1 ? (rule.unitOne ?? rule.unit) : rule.unit;

  return (
    <div className="space-y-2">
      <Label htmlFor="order-quantity" className="text-sm font-medium">
        How many?
      </Label>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-full"
          aria-label={`Fewer ${rule.unit}`}
          disabled={value <= rule.min}
          onClick={() => onChange(clamp(value - rule.step))}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Input
            id="order-quantity"
            type="number"
            inputMode="numeric"
            min={rule.min}
            max={rule.max}
            step={rule.step}
            value={value}
            aria-describedby={rule.hint ? "order-quantity-hint" : undefined}
            onChange={(e) => onChange(clamp(Number(e.target.value)))}
            onBlur={(e) => onChange(clamp(Number(e.target.value)))}
            className="h-12 rounded-xl text-center text-lg"
          />
          <span className="shrink-0 text-sm text-muted-foreground">{unit}</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-full"
          aria-label={`More ${rule.unit}`}
          disabled={value >= rule.max}
          onClick={() => onChange(clamp(value + rule.step))}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      {rule.hint && (
        <p id="order-quantity-hint" className="text-xs text-muted-foreground">
          {rule.hint}
        </p>
      )}
      <p className="sr-only" aria-live="polite">
        {value} {unit}
      </p>
    </div>
  );
}
