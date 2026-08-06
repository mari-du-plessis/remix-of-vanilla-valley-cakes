/**
 * Cake builder domain types.
 *
 * The builder renders a cake as a stack of small, reusable SVG assets rather
 * than one finished picture. Every asset lives in the database
 * (`cake_builder_assets`) so the artwork can be inspected, edited and versioned
 * by an admin — or later a designer — without touching application code.
 *
 * Assets are placed by their `slot`, which is the rendering layer they belong
 * to. New decorations only need a row in the asset library plus a link to the
 * product option that switches them on.
 */

export type CakeAssetCategory =
  | "board"
  | "shape"
  | "icing"
  | "drip"
  | "flower"
  | "leaf"
  | "sprinkle"
  | "pearl"
  | "gold_leaf"
  | "topper"
  | "text_plaque"
  | "border"
  | "pattern"
  | "decoration";

/** The rendering layer an asset is drawn on, back to front. */
export type CakeAssetSlot =
  | "board"
  | "tier-body"
  | "tier-finish"
  | "drip"
  | "border"
  | "cluster"
  | "scatter"
  | "topper"
  | "text";

export type CakeAsset = {
  id: string;
  key: string;
  name: string;
  category: CakeAssetCategory;
  slot: CakeAssetSlot;
  svg_content: string;
  z_index: number;
  version: number;
  is_active: boolean;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CakeAssetOptionLink = {
  id: string;
  asset_id: string;
  option_id: string;
};

export const CAKE_ASSET_COLUMNS =
  "id, key, name, category, slot, svg_content, z_index, version, is_active, notes, metadata, created_at, updated_at" as const;

export const CAKE_ASSET_LINK_COLUMNS = "id, asset_id, option_id" as const;

export const CAKE_ASSET_CATEGORIES: { value: CakeAssetCategory; label: string }[] = [
  { value: "board", label: "Cake board" },
  { value: "shape", label: "Tier shape" },
  { value: "icing", label: "Icing / finish" },
  { value: "drip", label: "Drip" },
  { value: "flower", label: "Flowers" },
  { value: "leaf", label: "Leaves" },
  { value: "sprinkle", label: "Sprinkles" },
  { value: "pearl", label: "Pearls" },
  { value: "gold_leaf", label: "Gold leaf" },
  { value: "topper", label: "Topper" },
  { value: "text_plaque", label: "Text plaque" },
  { value: "border", label: "Border" },
  { value: "pattern", label: "Pattern" },
  { value: "decoration", label: "Decoration" },
];

export const CAKE_ASSET_SLOTS: { value: CakeAssetSlot; label: string; hint: string }[] = [
  { value: "board", label: "Board", hint: "Drawn under the cake." },
  { value: "tier-body", label: "Tier body", hint: "Stretched to each tier." },
  { value: "tier-finish", label: "Tier finish", hint: "Overlay on each tier." },
  { value: "drip", label: "Drip", hint: "Over the top edge of a tier." },
  { value: "border", label: "Border", hint: "Along the base of each tier." },
  { value: "cluster", label: "Cluster", hint: "Placed at tier junctions." },
  { value: "scatter", label: "Scatter", hint: "Spread across the tier faces." },
  { value: "topper", label: "Topper", hint: "Above the top tier." },
  { value: "text", label: "Text", hint: "Plaque for the message." },
];

/** One configurable tier of the live design. */
export type CakeTierDesign = {
  flavour: string;
  filling: string;
  spongeColor: string;
  fillingColor: string;
};

/**
 * Everything the renderer needs. Derived from catalog selections
 * (`lib/design.ts`) so the wizard, the admin preview lab and any future
 * template or quotation surface all draw from the same shape.
 */
export type CakeDesign = {
  shapeKey: string;
  tierCount: number;
  layerCount: number;
  icingKey: string;
  tiers: CakeTierDesign[];
  /** Asset keys switched on by the customer's selections. */
  assetKeys: string[];
  colors: Record<string, string>;
  text: string;
  label: string;
};

export const cakeBuilderKeys = {
  all: ["cake-builder"] as const,
  assets: ["cake-builder", "assets"] as const,
  links: ["cake-builder", "asset-options"] as const,
};
