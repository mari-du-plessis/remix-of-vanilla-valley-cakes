import { Label } from "@/components/ui/label";
import {
  APPEARANCE_GROUP_LABELS,
  appearanceTokensFor,
  type AppearanceGroupKey,
} from "@/config/cake-builder";

/**
 * Maps a catalog option to how it should look in the SVG cake builder.
 * Replaces the raw "builder token" text field: the owner picks from the known
 * illustration pieces and, where it matters, the colour used to draw them.
 */
export function AppearanceField({
  groupKey,
  token,
  colour,
  onTokenChange,
  onColourChange,
}: {
  groupKey: string | null;
  token: string;
  colour: string;
  onTokenChange: (value: string) => void;
  onColourChange: (value: string) => void;
}) {
  const tokens = appearanceTokensFor(groupKey);
  const grouped = tokens.reduce<Record<string, typeof tokens>>((acc, entry) => {
    (acc[entry.group] ??= []).push(entry);
    return acc;
  }, {});
  const order = Object.keys(grouped) as AppearanceGroupKey[];

  return (
    <div className="rounded-xl border border-border/70 bg-background/60 p-4">
      <p className="text-sm font-medium">Cake builder appearance</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Choose what this option draws on the live cake illustration. Leave it empty
        if it has no visual effect.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Appearance
          </Label>
          <select
            value={token}
            onChange={(e) => onTokenChange(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">— no visual effect —</option>
            {order.map((key) => (
              <optgroup key={key} label={APPEARANCE_GROUP_LABELS[key]}>
                {grouped[key]!.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {token && (
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Colour
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colour}
                onChange={(e) => onColourChange(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background"
                aria-label="Appearance colour"
              />
              <span className="text-xs text-muted-foreground">{colour}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
