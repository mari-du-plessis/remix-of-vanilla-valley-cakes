import { SelectableCard } from "@/components/common";
import { Muted } from "@/components/common/Typography";
import type { Product } from "@/features/catalog/types";

/**
 * "What are we baking?" — the entry point of the order wizard and the stage
 * that decides which ordering workflow the customer walks through.
 *
 * It is deliberately generic: the catalog supplies the products (name and
 * description are edited by the bakery in Admin), and the flow registry maps
 * the chosen product to its workflow. Nothing internal is shown to the
 * customer — no slugs, families, builders or option groups.
 */
export function ProductStep({
  value,
  choices,
  onChange,
}: {
  value: string;
  choices: Product[];
  onChange: (slug: string) => void;
}) {
  return (
    <section className="space-y-5">
      <h2 className="text-3xl">What are we baking?</h2>
      <Muted>
        Choose what you'd like to order. We'll only ask the questions that matter for it.
      </Muted>
      <div
        role="radiogroup"
        aria-label="What are we baking?"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {choices.map((p) => (
          <SelectableCard
            key={p.slug}
            selected={value === p.slug}
            onSelect={() => onChange(p.slug)}
            className="p-4 text-sm"
          >
            <span className="block font-medium">{p.name}</span>
            {p.description && (
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {p.description}
              </span>
            )}
          </SelectableCard>
        ))}
      </div>
    </section>
  );
}
