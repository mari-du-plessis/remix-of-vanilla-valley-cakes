import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/common/Typography";
import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import { tierLabel } from "@/features/order/lib/tiers";
import type { OrderFormState } from "@/features/order/types";
import { useCakeAssets } from "../hooks/useCakeBuilder";
import type { GuidedBuilder } from "../hooks/useGuidedBuilder";
import { CakeStage } from "./CakeStage";
import { ChoiceGrid } from "./ChoiceGrid";

/**
 * GuidedCakeBuilder — the customer-facing cake builder.
 *
 * It is a presentation layer over the existing architecture: the steps come
 * from the catalog, the artwork from the asset library and every answer is
 * written straight back into the order form. One question is asked at a time,
 * with the live illustration always in view above it.
 */
export function GuidedCakeBuilder({
  form,
  catalog,
  builder,
  onCakeTextChange,
}: {
  form: OrderFormState;
  catalog: CakeCatalog;
  builder: GuidedBuilder;
  onCakeTextChange: (value: string) => void;
}) {
  const { data: assetRows = [] } = useCakeAssets();
  const assets = useMemo(() => new Map(assetRows.map((a) => [a.key, a])), [assetRows]);

  const { step, steps, stepIndex, setStepIndex, tierCount, valueOf, select } = builder;
  const tiers = Array.from({ length: tierCount }, (_, i) => i);

  return (
    <section className="space-y-6">
      <CakeStage
        form={form}
        catalog={catalog}
        caption={form.size ? catalog.sizes.find((s) => s.id === form.size)?.label : undefined}
        className="sticky top-2 z-10"
      />

      {/* step rail — a calm sense of place, and a way back to any answer */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {steps.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStepIndex(i)}
            className={
              i === stepIndex
                ? "eyebrow shrink-0 rounded-full bg-primary/15 px-3 py-1 text-[0.6rem] text-primary"
                : "eyebrow shrink-0 rounded-full px-3 py-1 text-[0.6rem] text-muted-foreground hover:text-foreground"
            }
          >
            {s.title}
          </button>
        ))}
      </div>

      {step && (
        <div key={step.key} className="animate-rise-in space-y-5">
          <Section title={step.title} description={step.subtitle} />

          {step.perTier && tierCount > 1 ? (
            <div className="space-y-5">
              {tiers.map((tier) => (
                <div
                  key={tier}
                  className="space-y-3 rounded-2xl border border-border/70 bg-background/50 p-4"
                >
                  <p className="eyebrow text-[0.6rem] text-primary">
                    {tierLabel(tier, tierCount)}
                  </p>
                  <ChoiceGrid
                    choices={step.choices}
                    selected={valueOf(step, tier)}
                    onSelect={(id) => select(step, id, tier)}
                    assets={assets}
                    columns={3}
                  />
                </div>
              ))}
            </div>
          ) : (
            <ChoiceGrid
              choices={step.choices}
              selected={valueOf(step)}
              onSelect={(id) => select(step, id)}
              assets={assets}
              columns={step.kind === "flavour" || step.kind === "filling" ? 3 : 2}
            />
          )}

          {step.kind === "decoration" && (
            <div>
              <Label htmlFor="cake-text" className="mb-2 block">
                Message on the cake (optional)
              </Label>
              <Input
                id="cake-text"
                value={form.cakeText}
                maxLength={40}
                onChange={(e) => onCakeTextChange(e.target.value)}
                placeholder="Happy Birthday Sonja"
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
