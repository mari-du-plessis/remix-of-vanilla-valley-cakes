import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Field, TextField } from "@/features/admin/catalog/fields";
import { AssetPreview } from "@/features/cake-builder/components/AssetLayer";
import { slugify } from "@/features/catalog/lib/slug";
import { useAllOptions, useOptionGroups } from "@/features/catalog/hooks/useCatalog";
import {
  useDeleteCakeAsset,
  useSaveCakeAsset,
  useSetCakeAssetOption,
} from "@/features/cake-builder/hooks/useCakeAssetMutations";
import {
  CAKE_ASSET_CATEGORIES,
  CAKE_ASSET_SLOTS,
  type CakeAsset,
  type CakeAssetCategory,
  type CakeAssetOptionLink,
  type CakeAssetSlot,
} from "@/features/cake-builder/types";

const BLANK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="var(--cake-icing,#f3e9dc)" />
</svg>`;

type Draft = {
  id?: string;
  key: string;
  name: string;
  category: CakeAssetCategory;
  slot: CakeAssetSlot;
  svg_content: string;
  z_index: number;
  version: number;
  is_active: boolean;
  notes: string;
};

const toDraft = (asset: CakeAsset | null): Draft =>
  asset
    ? {
        id: asset.id,
        key: asset.key,
        name: asset.name,
        category: asset.category,
        slot: asset.slot,
        svg_content: asset.svg_content,
        z_index: asset.z_index,
        version: asset.version,
        is_active: asset.is_active,
        notes: asset.notes ?? "",
      }
    : {
        key: "",
        name: "",
        category: "decoration",
        slot: "cluster",
        svg_content: BLANK_SVG,
        z_index: 70,
        version: 1,
        is_active: true,
        notes: "",
      };

/**
 * Developer-friendly asset editor: the raw SVG stays visible and editable
 * beside a live preview, while the business fields (name, category, layer,
 * linked options) keep the library usable for the bakery owner.
 */
export function AssetEditor({
  asset,
  links,
  onClose,
}: {
  asset: CakeAsset | null;
  links: CakeAssetOptionLink[];
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(asset));
  const save = useSaveCakeAsset();
  const remove = useDeleteCakeAsset();
  const setOption = useSetCakeAssetOption();
  const { data: options = [] } = useAllOptions();
  const { data: groups = [] } = useOptionGroups();

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const linkedOptionIds = useMemo(
    () => new Set(links.filter((l) => l.asset_id === asset?.id).map((l) => l.option_id)),
    [links, asset?.id],
  );

  const groupName = (id: string) => groups.find((g) => g.id === id)?.name ?? "Other";
  const nameError = !draft.name.trim() ? "A name is required" : null;

  return (
    <div className="space-y-5 rounded-2xl border border-border/70 bg-background/60 p-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Name
            </Label>
            <Input
              value={draft.name}
              placeholder="Fresh flowers"
              onChange={(e) => {
                const name = e.target.value;
                setDraft((d) => ({
                  ...d,
                  name,
                  key: d.id ? d.key : slugify(name),
                }));
              }}
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          <TextField
            label="Internal identifier"
            value={draft.key}
            onChange={(v) => set("key", slugify(v))}
            placeholder="decor-fresh-flowers"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(e) => set("category", e.target.value as CakeAssetCategory)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {CAKE_ASSET_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rendering layer">
              <select
                value={draft.slot}
                onChange={(e) => set("slot", e.target.value as CakeAssetSlot)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {CAKE_ASSET_SLOTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} — {s.hint}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Stacking order"
              type="number"
              value={String(draft.z_index)}
              onChange={(v) => set("z_index", Number(v) || 0)}
            />
            <Field label="Active">
              <div className="flex h-10 items-center gap-3">
                <Switch
                  checked={draft.is_active}
                  onCheckedChange={(v) => set("is_active", v)}
                />
                <span className="text-sm text-muted-foreground">
                  Version {draft.version}
                </span>
              </div>
            </Field>
          </div>

          <Field label="Notes">
            <Textarea
              value={draft.notes}
              rows={2}
              placeholder="How this piece should be used."
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </div>

        <div className="space-y-4">
          <Field label="SVG source">
            <Textarea
              value={draft.svg_content}
              rows={14}
              spellCheck={false}
              className="font-mono text-xs"
              onChange={(e) => set("svg_content", e.target.value)}
            />
          </Field>
          <div className="rounded-xl border border-border/70 bg-[repeating-conic-gradient(#0000_0_25%,#00000008_0_50%)] bg-[length:16px_16px] p-4">
            <AssetPreview
              asset={{ svg_content: draft.svg_content, name: draft.name || "Preview" }}
              className="mx-auto h-40 w-auto"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Paint with <code>var(--cake-icing)</code>, <code>var(--cake-gold)</code>,{" "}
            <code>var(--cake-leaf)</code> and friends so the piece re-colours with the
            customer's choices. Keep the background transparent.
          </p>
        </div>
      </div>

      {asset && (
        <div className="rounded-xl border border-border/70 p-4">
          <p className="text-sm font-medium">Linked product options</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Selecting one of these options in the order wizard draws this asset.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-64 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={linkedOptionIds.has(option.id)}
                  onChange={(e) =>
                    setOption.mutate({
                      asset_id: asset.id,
                      option_id: option.id,
                      enabled: e.target.checked,
                    })
                  }
                />
                <span className="truncate">
                  {option.name}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({groupName(option.group_id)})
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={!!nameError || !draft.key || save.isPending}
          onClick={() =>
            save.mutate(
              {
                ...draft,
                name: draft.name.trim(),
                notes: draft.notes.trim() || null,
              },
              { onSuccess: onClose },
            )
          }
        >
          Save asset
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        {asset && (
          <Button
            variant="ghost"
            className="ml-auto text-destructive"
            onClick={() => {
              if (confirm(`Delete "${asset.name}"?`))
                remove.mutate(asset.id, { onSuccess: onClose });
            }}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
