import { Label } from "@/components/ui/label";
import { OptionPill, SelectField } from "@/components/common";
import { FILLINGS, FLAVOURS, getPairing } from "@/config/catalog";

type FlavourPickerProps = {
  flavour: string;
  filling: string;
  onFlavourChange: (name: string) => void;
  onFillingChange: (name: string) => void;
  compact?: boolean;
};

/**
 * Flavour pills + conditional filling selector.
 * Shared by the single-cake path and each tier of a tiered cake.
 */
export function FlavourPicker({
  flavour,
  filling,
  onFlavourChange,
  onFillingChange,
  compact = false,
}: FlavourPickerProps) {
  const pairing = flavour ? getPairing(flavour) : null;

  return (
    <>
      <div>
        <Label className={compact ? "mb-1 block text-xs" : "mb-1 block"}>
          Choose Your Flavour
        </Label>
        <p
          className={
            compact
              ? "text-[11px] text-muted-foreground mb-2 italic"
              : "text-xs text-muted-foreground mb-3 italic"
          }
        >
          Some flavours are thoughtfully paired with their signature fillings.
        </p>
        <div className="flex flex-wrap gap-2">
          {FLAVOURS.map((f) => (
            <OptionPill
              key={f.name}
              size={compact ? "sm" : "md"}
              selected={flavour === f.name}
              onSelect={() => onFlavourChange(f.name)}
            >
              {f.name}
            </OptionPill>
          ))}
        </div>
      </div>

      {flavour && pairing && (
        <p
          className={
            compact
              ? "text-xs italic text-primary/80 transition-opacity duration-300"
              : "text-sm italic text-primary/80 transition-opacity duration-300"
          }
        >
          Paired with: {pairing}
        </p>
      )}

      {flavour && !pairing && (
        <div className="transition-all duration-300">
          <Label className={compact ? "mb-2 block text-xs" : "mb-2 block"}>
            Choose your filling
          </Label>
          <SelectField
            value={filling}
            onChange={onFillingChange}
            options={FILLINGS}
            placeholder="Select a filling…"
            size={compact ? "sm" : "md"}
          />
        </div>
      )}
    </>
  );
}
