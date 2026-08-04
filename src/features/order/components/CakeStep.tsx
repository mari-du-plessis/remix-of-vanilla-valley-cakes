import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectableCard } from "@/components/common";
import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import { tierLabel } from "../lib/tiers";
import type { CakeTier, OrderFormState } from "../types";
import { FlavourPicker } from "./FlavourPicker";

type CakeStepProps = {
  form: OrderFormState;
  catalog: CakeCatalog;
  onSizeChange: (sizeId: string) => void;
  onFlavourChange: (name: string) => void;
  onFillingChange: (name: string) => void;
  onTierFlavourChange: (index: number, name: string) => void;
  onTierFieldChange: (index: number, key: keyof CakeTier, value: string) => void;
  onToggleExtra: (extra: string) => void;
};

export function CakeStep({
  form,
  catalog,
  onSizeChange,
  onFlavourChange,
  onFillingChange,
  onTierFlavourChange,
  onTierFieldChange,
  onToggleExtra,
}: CakeStepProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-3xl">Design your cake</h2>

      <div>
        <Label className="mb-3 block">Size</Label>
        <div className="grid grid-cols-2 gap-2">
          {catalog.sizes.map((s) => (
            <SelectableCard
              key={s.id}
              selected={form.size === s.id}
              onSelect={() => onSizeChange(s.id)}
              className="p-3"
            >
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.serves}</p>
            </SelectableCard>
          ))}
        </div>
      </div>

      {form.tiers.length > 0 ? (
        <div className="space-y-5">
          {form.tiers.map((t, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-border/70 bg-background/50 space-y-4"
            >
              <p className="text-sm font-medium tracking-wide uppercase text-primary">
                {tierLabel(i, form.tiers.length)}
              </p>
              <FlavourPicker
                compact
                flavour={t.flavour}
                filling={t.filling}
                flavours={catalog.flavours}
                fillings={catalog.fillings}
                onFlavourChange={(name) => onTierFlavourChange(i, name)}
                onFillingChange={(name) => onTierFieldChange(i, "filling", name)}
              />
            </div>
          ))}
        </div>
      ) : (
        <FlavourPicker
          flavour={form.flavour}
          filling={form.filling}
          flavours={catalog.flavours}
          fillings={catalog.fillings}
          onFlavourChange={onFlavourChange}
          onFillingChange={onFillingChange}
        />
      )}

      <div>
        <Label className="mb-3 block">Extras (optional)</Label>
        <div className="space-y-2">
          {catalog.extras.map((e) => (
            <label
              key={e}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background cursor-pointer"
            >
              <Checkbox
                checked={form.extras.includes(e)}
                onCheckedChange={() => onToggleExtra(e)}
              />
              <span className="text-sm">{e}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
