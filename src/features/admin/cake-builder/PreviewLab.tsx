import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminSection } from "@/features/admin/components/AdminSection";
import { CakePreview } from "@/features/cake-builder/components/CakePreview";
import { CAKE_COLOR_DEFAULTS, spongeColour, fillingColour } from "@/config/cake-builder";
import type { CakeAsset, CakeDesign } from "@/features/cake-builder/types";

/**
 * Preview lab — the developer/designer view of the renderer.
 * Every asset in the library can be toggled on a synthetic design so the
 * artwork can be checked in context without placing a real order.
 */
export function PreviewLab({ assets }: { assets: CakeAsset[] }) {
  const shapes = assets.filter((a) => a.slot === "tier-body");
  const [shapeKey, setShapeKey] = useState("shape-round");
  const [tierCount, setTierCount] = useState(2);
  const [text, setText] = useState("Happy Birthday");
  const [enabled, setEnabled] = useState<string[]>(["board-wood", "icing-smooth"]);

  const toggle = (key: string) =>
    setEnabled((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key],
    );

  const design: CakeDesign = useMemo(
    () => ({
      view: "side",
      shapeKey,

      tierCount,
      layerCount: 2,
      icingKey: "icing-smooth",
      treatment: "solid",
      tiers: Array.from({ length: Math.max(1, tierCount) }, () => ({
        flavour: "Vanilla",
        filling: "Vanilla Buttercream",
        spongeColor: spongeColour("Vanilla"),
        fillingColor: fillingColour("Vanilla Buttercream"),
        icingColor: CAKE_COLOR_DEFAULTS["--cake-icing"]!,
        colourName: "",
      })),
      assetKeys: [shapeKey, ...enabled],
      colors: CAKE_COLOR_DEFAULTS,
      text,
      label: "Preview lab",
    }),
    [shapeKey, tierCount, enabled, text],
  );

  const toggleable = assets.filter((a) => a.slot !== "tier-body");

  return (
    <AdminSection
      title="Preview lab"
      description="Compose a test cake from the library to check how each asset renders."
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
          <CakePreview design={design} assets={assets} className="h-[380px] w-full" />
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Shape
              </Label>
              <select
                value={shapeKey}
                onChange={(e) => setShapeKey(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {shapes.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Tiers
              </Label>
              <Input
                type="number"
                min={1}
                max={6}
                value={tierCount}
                onChange={(e) => setTierCount(Math.min(6, Math.max(1, Number(e.target.value))))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Message
              </Label>
              <Input value={text} onChange={(e) => setText(e.target.value)} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Layers</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {toggleable.map((asset) => (
                <label
                  key={asset.key}
                  className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={enabled.includes(asset.key)}
                    onChange={() => toggle(asset.key)}
                  />
                  <span className="truncate">{asset.name}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {asset.slot}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminSection>
  );
}
