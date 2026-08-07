import { cn } from "@/lib/utils";
import { AssetPreview } from "./AssetLayer";
import type { BuilderChoice } from "../lib/steps";
import type { CakeAsset } from "../types";

/**
 * The one way a customer picks something in the cake builder.
 *
 * Choices illustrate themselves: an asset thumbnail when the library has
 * artwork, a colour swatch for flavours and fillings, plain type otherwise.
 * Any new option or asset therefore renders correctly with no extra UI code.
 */
export function ChoiceGrid({
  choices,
  selected,
  onSelect,
  assets,
  columns = 2,
}: {
  choices: BuilderChoice[];
  selected: string[];
  onSelect: (id: string) => void;
  assets: Map<string, CakeAsset>;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2",
      )}
    >
      {choices.map((choice) => {
        const isSelected = selected.includes(choice.id);
        const asset = choice.assetKey ? assets.get(choice.assetKey) : undefined;
        return (
          <button
            key={choice.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(choice.id)}
            className={cn(
              "group flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-all duration-300",
              isSelected
                ? "border-primary bg-primary/10 shadow-[var(--shadow-soft)]"
                : "border-border bg-card/60 hover:border-primary/50 hover:bg-card",
            )}
          >
            {asset ? (
              <span className="flex h-16 w-full items-center justify-center">
                <AssetPreview asset={asset} className="max-h-16 w-auto" />
              </span>
            ) : choice.swatch ? (
              <span
                aria-hidden
                className="h-6 w-6 rounded-full border border-border/60"
                style={{ background: choice.swatch }}
              />
            ) : null}

            <span className="text-sm font-medium leading-tight">{choice.label}</span>
            {choice.hint && (
              <span className="text-xs leading-snug text-muted-foreground">{choice.hint}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
