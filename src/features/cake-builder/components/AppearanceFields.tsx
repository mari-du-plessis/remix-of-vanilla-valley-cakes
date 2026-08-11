import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Muted } from "@/components/common/Typography";
import { tierLabel } from "@/features/order/lib/tiers";
import {
  relevantColourFields,
  setDecorationColour,
  setTierColour,
  setTopper,
  tierColour,
  type CakeAppearance,
} from "../lib/appearance";

/**
 * Colour fields for the custom cake.
 *
 * The bakery does not work from a fixed palette, so colours are described in
 * the customer's own words ("dusty rose", "champagne gold") and the
 * inspiration photo remains the primary visual reference. Each tier is asked
 * for separately, because tiers frequently differ, and decoration colours are
 * asked for independently — a white cake regularly carries a gold drip and
 * pink macarons.
 *
 * Only the decorations the customer actually chose are asked about, so the
 * step stays short.
 */
export function AppearanceFields({
  appearance,
  tierCount,
  extras,
  onChange,
}: {
  appearance: CakeAppearance;
  tierCount: number;
  extras: string[];
  onChange: (next: CakeAppearance) => void;
}) {
  const tiers = Array.from({ length: tierCount }, (_, i) => i);
  const fields = relevantColourFields(extras);
  const wantsTopper = extras.some((e) => /topper/i.test(e));

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <Label className="block">Cake colours</Label>
          <Muted className="mt-1 block text-xs">
            {tierCount > 1
              ? "Each tier can be its own colour — leave any blank if you'd rather we follow your photo."
              : "Describe the colour you'd like, or leave it blank and we'll follow your inspiration photo."}
          </Muted>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {tiers.map((index) => (
            <div key={index}>
              <Label htmlFor={`tier-colour-${index}`} className="mb-1.5 block text-xs">
                {tierCount > 1 ? tierLabel(index, tierCount) : "Colour"}
              </Label>
              <Input
                id={`tier-colour-${index}`}
                value={tierColour(appearance, index)?.name ?? ""}
                maxLength={60}
                placeholder="e.g. ivory, dusty rose, sage"
                onChange={(e) => onChange(setTierColour(appearance, index, e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>

      {fields.length > 0 && (
        <div className="space-y-3">
          <div>
            <Label className="block">Decoration colours</Label>
            <Muted className="mt-1 block text-xs">
              These are separate from the cake colour — a white cake can have a gold drip.
            </Muted>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key}>
                <Label htmlFor={`decor-colour-${field.key}`} className="mb-1.5 block text-xs">
                  {field.label}
                </Label>
                <Input
                  id={`decor-colour-${field.key}`}
                  value={appearance.decorations[field.key]?.name ?? ""}
                  maxLength={60}
                  placeholder={field.hint}
                  onChange={(e) =>
                    onChange(setDecorationColour(appearance, field.key, e.target.value))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {wantsTopper && (
        <div className="space-y-3">
          <Label className="block">Cake topper</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="topper-style" className="mb-1.5 block text-xs">
                Style
              </Label>
              <Input
                id="topper-style"
                value={appearance.topper.style}
                maxLength={60}
                placeholder="e.g. acrylic, wooden, glitter"
                onChange={(e) => onChange(setTopper(appearance, { style: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="topper-wording" className="mb-1.5 block text-xs">
                Wording
              </Label>
              <Input
                id="topper-wording"
                value={appearance.topper.wording}
                maxLength={60}
                placeholder="e.g. Happy Birthday Sonja"
                onChange={(e) => onChange(setTopper(appearance, { wording: e.target.value }))}
              />
            </div>
          </div>
          <Muted className="block text-[11px]">
            Topper wording is sent with your enquiry. The preview shows the topper's style and
            colour rather than the exact lettering.
          </Muted>
        </div>
      )}
    </div>
  );
}
