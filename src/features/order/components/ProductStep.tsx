import { SelectableCard } from "@/components/common";
import { Muted } from "@/components/common/Typography";
import type { Product } from "@/features/catalog/types";

/**
 * "What are we baking?" — the stage that decides which ordering workflow the
 * customer enters. It is deliberately generic: the catalog supplies the
 * products, and the flow registry maps the chosen slug to a workflow.
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
      <Muted>Start with the kind of creation you have in mind.</Muted>
      <div className="grid grid-cols-2 gap-2">
        {choices.map((p) => (
          <SelectableCard
            key={p.slug}
            selected={value === p.slug}
            onSelect={() => onChange(p.slug)}
            className="p-4 text-sm"
          >
            <span className="block">{p.name}</span>
            {p.description && (
              <span className="mt-1 block text-xs text-muted-foreground">{p.description}</span>
            )}
          </SelectableCard>
        ))}
      </div>
    </section>
  );
}
