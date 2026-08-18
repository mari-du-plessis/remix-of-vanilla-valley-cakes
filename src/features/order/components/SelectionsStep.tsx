import { LoadingState, OptionPill, SelectableCard } from "@/components/common";
import { Muted } from "@/components/common/Typography";
import { QuantityField } from "./QuantityField";
import { isSelected } from "../lib/selections";
import type { SelectionGroup } from "../hooks/useProductSelections";
import type { QuantityRule } from "../flows/product-requirements";
import type { OrderSelection } from "../types";

/**
 * Catalog-driven questions for a non-cake product family.
 *
 * One shared stage for cupcakes, cheesecakes, biscuits, rusks, cake cups and
 * tarts: the groups, their options and whether they allow more than one answer
 * all come from the database, so this component never needs a product-specific
 * branch.
 */
export function SelectionsStep({
  headline,
  groups,
  selections,
  quantity,
  quantityRule,
  isPending,
  onToggle,
  onQuantityChange,
}: {
  headline: string;
  groups: SelectionGroup[];
  selections: OrderSelection[];
  quantity: number;
  quantityRule: QuantityRule | null;
  isPending: boolean;
  onToggle: (selection: OrderSelection, multi: boolean) => void;
  onQuantityChange: (value: number) => void;
}) {
  if (isPending && groups.length === 0) return <LoadingState label="Loading choices…" />;

  return (
    <section className="space-y-7">
      <div className="space-y-2">
        <h2 className="text-3xl">{headline}</h2>
        <Muted>Tell us what you'd like and we'll come back with a quotation.</Muted>
      </div>

      {groups.map((group) => (
        <div key={group.key} className="space-y-3">
          <div>
            <p className="text-sm font-medium">
              {group.name}
              {group.required && <span className="ml-1 text-primary">*</span>}
            </p>
            {(group.description || group.multi) && (
              <p className="mt-1 text-xs text-muted-foreground">
                {group.description ?? "Choose as many as you like."}
              </p>
            )}
          </div>

          {group.multi ? (
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => (
                <OptionPill
                  key={option.key}
                  size="sm"
                  selected={isSelected(selections, group.key, option.key)}
                  onSelect={() =>
                    onToggle(
                      {
                        groupKey: group.key,
                        groupLabel: group.name,
                        valueKey: option.key,
                        valueLabel: option.name,
                      },
                      true,
                    )
                  }
                >
                  {option.name}
                </OptionPill>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {group.options.map((option) => (
                <SelectableCard
                  key={option.key}
                  className="p-4 text-sm"
                  selected={isSelected(selections, group.key, option.key)}
                  onSelect={() =>
                    onToggle(
                      {
                        groupKey: group.key,
                        groupLabel: group.name,
                        valueKey: option.key,
                        valueLabel: option.name,
                      },
                      false,
                    )
                  }
                >
                  <span className="block">{option.name}</span>
                  {option.description && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </SelectableCard>
              ))}
            </div>
          )}
        </div>
      ))}

      {quantityRule && (
        <QuantityField rule={quantityRule} value={quantity} onChange={onQuantityChange} />
      )}
    </section>
  );
}
