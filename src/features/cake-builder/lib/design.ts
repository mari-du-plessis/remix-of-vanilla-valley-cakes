import { slugify } from "@/features/catalog/lib/slug";
import type { CatalogOption } from "@/features/catalog/types";
import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import { tierCount as catalogTierCount, sizeLabel } from "@/features/catalog/lib/cake-catalog";
import type { OrderFormState } from "@/features/order/types";
import {
  CAKE_COLOR_DEFAULTS,
  fillingColour,
  spongeColour,
} from "@/config/cake-builder";
import type { CakeAsset, CakeAssetOptionLink, CakeDesign, CakeTierDesign } from "../types";

/**
 * Pure projection: catalog selections -> a renderable cake design.
 *
 * The option → asset mapping is data-driven:
 *   1. an explicit link row in `cake_builder_asset_options`
 *   2. the option's builder appearance token (`options.svg_token`)
 *   3. the option's own key, then a `decor-<slug of name>` guess
 *
 * Steps 3 and 4 are conveniences so newly added options illustrate sensibly
 * before anyone opens the asset library; step 1 always wins.
 */

export type DesignSources = {
  options: CatalogOption[];
  assets: CakeAsset[];
  links: CakeAssetOptionLink[];
};

const norm = (value: string) => value.trim().toLowerCase();

function optionAssetKey(
  option: CatalogOption | undefined,
  sources: DesignSources,
  assetKeys: Set<string>,
): string | null {
  if (!option) return null;
  const linked = sources.links.find((l) => l.option_id === option.id);
  if (linked) {
    const asset = sources.assets.find((a) => a.id === linked.asset_id);
    if (asset) return asset.key;
  }
  if (option.svg_token && assetKeys.has(option.svg_token)) return option.svg_token;
  if (assetKeys.has(option.key)) return option.key;
  const guess = `decor-${slugify(option.name)}`;
  return assetKeys.has(guess) ? guess : null;
}

const colourOf = (option: CatalogOption | undefined) => {
  const value = option?.metadata?.["colour"] ?? option?.metadata?.["color"];
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

export function buildCakeDesign(
  form: OrderFormState,
  catalog: CakeCatalog,
  sources: DesignSources,
): CakeDesign {
  const assetKeys = new Set(sources.assets.filter((a) => a.is_active).map((a) => a.key));
  const byName = new Map(sources.options.map((o) => [norm(o.name), o]));
  const byKey = new Map(sources.options.map((o) => [o.key, o]));

  const sizeOption = form.size ? byKey.get(form.size) : undefined;
  const sizeMeta = sizeOption?.metadata ?? {};

  /** Shape resolution: linked shape asset → metadata → token → round. */
  const linkedShape = sizeOption
    ? sources.links
        .filter((l) => l.option_id === sizeOption.id)
        .map((l) => sources.assets.find((a) => a.id === l.asset_id))
        .find((a) => a?.slot === "tier-body")?.key
    : undefined;
  const shapeFromMeta =
    typeof sizeMeta["shape"] === "string" ? (sizeMeta["shape"] as string) : null;
  const shapeKey =
    linkedShape ??
    (shapeFromMeta && assetKeys.has(shapeFromMeta) ? shapeFromMeta : null) ??
    (sizeOption?.svg_token?.startsWith("shape-") ? sizeOption.svg_token : null) ??
    "shape-round";


  const tiers: CakeTierDesign[] =
    form.tiers.length > 0
      ? form.tiers.map((tier) => ({
          flavour: tier.flavour,
          filling: tier.filling,
          spongeColor: colourOf(byName.get(norm(tier.flavour))) ?? spongeColour(tier.flavour),
          fillingColor: colourOf(byName.get(norm(tier.filling))) ?? fillingColour(tier.filling),
        }))
      : [
          {
            flavour: form.flavour,
            filling: form.filling,
            spongeColor: colourOf(byName.get(norm(form.flavour))) ?? spongeColour(form.flavour),
            fillingColor: colourOf(byName.get(norm(form.filling))) ?? fillingColour(form.filling),
          },
        ];

  /* Every selected extra contributes zero or one asset. */
  const extraOptions = form.extras.map((name) => byName.get(norm(name)));
  const extraKeys = form.extras
    .map((name, index) => {
      const option = extraOptions[index];
      const key = optionAssetKey(option, sources, assetKeys);
      if (key) return key;
      const guess = `decor-${slugify(name)}`;
      return assetKeys.has(guess) ? guess : null;
    })
    .filter((key): key is string => !!key);

  const icingKey =
    extraKeys.find((key) => key.startsWith("icing-")) ??
    (assetKeys.has("icing-smooth") ? "icing-smooth" : "");

  const colors: Record<string, string> = { ...CAKE_COLOR_DEFAULTS };
  const icingColour = colourOf(extraOptions.find((o) => o?.svg_token?.startsWith("icing-")));
  if (icingColour) colors["--cake-icing"] = icingColour;

  const layerCount =
    typeof sizeMeta["layers"] === "number" ? (sizeMeta["layers"] as number) : 2;

  return {
    shapeKey,
    tierCount: form.tiers.length || Math.max(1, catalogTierCount(catalog, form.size) || 1),
    layerCount,
    icingKey,
    tiers,
    assetKeys: Array.from(new Set(["board-wood", shapeKey, icingKey, ...extraKeys])).filter(
      Boolean,
    ),
    colors,
    text: form.cakeText?.trim() ?? "",
    label: form.size ? sizeLabel(catalog, form.size) : "Custom cake",
  };
}
