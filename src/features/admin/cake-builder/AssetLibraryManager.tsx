import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState, EmptyState } from "@/components/common";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminSection } from "@/features/admin/components/AdminSection";
import { AssetPreview } from "@/features/cake-builder/components/AssetLayer";
import {
  useCakeAssetLinks,
  useCakeAssets,
} from "@/features/cake-builder/hooks/useCakeBuilder";
import {
  CAKE_ASSET_CATEGORIES,
  type CakeAsset,
  type CakeAssetCategory,
} from "@/features/cake-builder/types";
import { AssetEditor } from "./AssetEditor";
import { MissingAssetsPanel } from "./MissingAssetsPanel";
import { PreviewLab } from "./PreviewLab";


/**
 * Cake builder asset library — the source of truth for every visual piece the
 * live cake preview draws. Assets are grouped by category, previewed in place
 * and edited (including their raw SVG) without leaving the admin panel.
 */
export function AssetLibraryManager() {
  const { data: assets = [], isPending } = useCakeAssets();
  const { data: links = [] } = useCakeAssetLinks();
  const [filter, setFilter] = useState<CakeAssetCategory | "all">("all");
  const [editing, setEditing] = useState<{ asset: CakeAsset | null } | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? assets : assets.filter((a) => a.category === filter)),
    [assets, filter],
  );

  const linkCount = (assetId: string) =>
    links.filter((l) => l.asset_id === assetId).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cake builder"
        description="Every shape, icing, drip and decoration the live cake preview draws. Edit the artwork here and the customer preview updates."
        action={
          <Button onClick={() => setEditing({ asset: null })}>
            <Plus className="mr-1 h-4 w-4" /> New asset
          </Button>
        }
      />

      {editing && (
        <AdminSection
          title={editing.asset ? `Edit ${editing.asset.name}` : "New asset"}
          description="Business details on the left, raw SVG and live preview on the right."
        >
          <AssetEditor
            asset={editing.asset}
            links={links}
            onClose={() => setEditing(null)}
          />
        </AdminSection>
      )}

      <AdminSection
        title="Asset library"
        description="Transparent, reusable pieces. Anything added here can be linked to a product option."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {[{ value: "all" as const, label: "All" }, ...CAKE_ASSET_CATEGORIES].map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value as CakeAssetCategory | "all")}
              className={
                filter === c.value
                  ? "rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
                  : "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              }
            >
              {c.label}
            </button>
          ))}
        </div>

        {isPending ? (
          <LoadingState />
        ) : visible.length === 0 ? (
          <EmptyState message="No assets in this category yet." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setEditing({ asset })}
                className="rounded-2xl border border-border/70 bg-background/60 p-3 text-left transition-colors hover:border-primary/50"
              >
                <div className="flex h-24 items-center justify-center rounded-xl bg-[repeating-conic-gradient(#0000_0_25%,#00000008_0_50%)] bg-[length:14px_14px]">
                  <AssetPreview asset={asset} className="max-h-20 w-auto" />
                </div>
                <p className="mt-2 truncate text-sm font-medium">{asset.name}</p>
                <p className="truncate text-xs text-muted-foreground">{asset.key}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {asset.slot} · v{asset.version}
                  {linkCount(asset.id) > 0 && ` · ${linkCount(asset.id)} option(s)`}
                  {!asset.is_active && " · inactive"}
                </p>
              </button>
            ))}
          </div>
        )}
      </AdminSection>

      {assets.length > 0 && <PreviewLab assets={assets} />}
    </div>
  );
}
