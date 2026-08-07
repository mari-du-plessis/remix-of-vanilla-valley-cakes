import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionTitle, Muted } from "@/components/common/Typography";
import { productFamily, usesCakeRenderer } from "@/config/product-builders";
import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import { tierLabel } from "@/features/order/lib/tiers";
import type { OrderFormState } from "@/features/order/types";
import { useCakeAssets } from "../hooks/useCakeBuilder";
import { InspirationPreview } from "./InspirationPreview";
import type { GuidedBuilder } from "../hooks/useGuidedBuilder";
import { CakeStage } from "./CakeStage";
import { ChoiceGrid } from "./ChoiceGrid";

/**
 * GuidedCakeBuilder — the customer-facing builder.
 *
 * It is a presentation layer over the existing architecture: the steps come
 * from the catalog, the artwork from the asset library and every answer is
 * written straight back into the order form.
 *
 * The live SVG illustration and the AI concept belong to the Custom Cake
 * family only. Other product families (cupcakes, cheesecakes, biscuits, tarts,
 * cake cups, rusks) use the same questions without a renderer until their own
 * builders ship.
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

  const rendersCake = usesCakeRenderer(form.product);
  const family = productFamily(form.product);

  return (
    <section className="space-y-6">
      {rendersCake ? (
        <>
          <CakeStage
            form={form}
            catalog={catalog}
            caption={form.size ? catalog.sizes.find((s) => s.id === form.size)?.label : undefined}
            showDisclaimer={false}
            className="sticky top-2 z-10"
          />

          <InspirationPreview url={form.aiPreviewUrl} />

          <p className="px-1 text-center text-[11px] leading-relaxed text-muted-foreground">
            The live preview shows the design you've configured using your selected options. When
            you send your request we also create an AI concept illustration of the same design.
            Both are intended to help visualise your cake and are not exact representations of the
            final handcrafted product. Final colours, decorations and finishing details may vary.
            You can also upload inspiration images and include additional notes to help us
            understand your vision.
          </p>
        </>
      ) : (
        <p className="surface-card rounded-2xl px-5 py-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          {family.label} are handcrafted to order. A dedicated visual builder for this range is on
          its way — for now, answer a few questions and upload any inspiration photos, and we'll
          finish the detail with you on WhatsApp.
        </p>
      )}

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
          <div className="space-y-1">
            <SectionTitle className="text-2xl">{step.title}</SectionTitle>
            <Muted>{step.subtitle}</Muted>
          </div>

          {step.perTier && tierCount > 1 ? (
            <div className="space-y-5">
              {tiers.map((tier) => (
                <div
                  key={tier}
                  className="space-y-3 rounded-2xl border border-border/70 bg-background/50 p-4"
                >
                  <p className="eyebrow text-[0.6rem] text-primary">{tierLabel(tier, tierCount)}</p>
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
