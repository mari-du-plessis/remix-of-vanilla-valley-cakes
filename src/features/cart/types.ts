/**
 * Cart / multi-product order domain.
 *
 * One customer order contains many order items, and each item carries its own
 * product-specific configuration as a discriminated union — never a flat bag
 * of unrelated nullable fields. Adding a product type later means adding one
 * member to `CartItemConfig` and one editor component; nothing else changes.
 *
 *   Order
 *   ├── CartItem (custom_cake) → CustomCakeConfig → CakeTierConfig[]
 *   ├── CartItem (cupcakes)    → CupcakeConfig
 *   └── CartItem (product)     → FixedProductConfig
 *
 * The cart lives on the customer's device until they send the enquiry, at
 * which point every item becomes one `order_items` row on a single order.
 */

import type { GalleryInspiration } from "@/features/gallery/lib/inspiration-reference";
import type { OrderSelection } from "@/features/order/types";
import type { TierPosition } from "@/features/cake-builder/lib/tier-position";

export type CartItemType = "custom_cake" | "cupcakes" | "product";

/** One independently configured tier. Stored bottom-first. */
export type CakeTierConfig = {
  /** Stable id so editing one tier can never touch another. */
  id: string;
  /** Explicit physical position — not derived from the array index by readers. */
  position: TierPosition;
  /** Diameter in centimetres, from the bakery's serving chart. */
  sizeCm: number | null;
  /** Servings for the chosen size, derived from the chart. */
  servings: number;
  flavour: string;
  filling: string;
  /**
   * True when the flavour has a mandatory paired filling configured in admin.
   * The customer cannot change a locked filling.
   */
  fillingLocked: boolean;
  /** Free-text colour description, e.g. "Sage green". */
  colour: string;
  /** Finish asset key, e.g. `icing-textured`. */
  finish: string;
  /** Shape asset key, e.g. `shape-round`. */
  shape: string;
};

/** Figurines are optional and will be priced from admin configuration. */
export type FigurineRequest = {
  required: boolean;
  description: string;
  quantity: number;
};

/**
 * What the AI may later suggest from an inspiration photo. Every field is
 * optional and every field is editable by the customer: suggestions are a
 * starting point, never authoritative. Anything the model cannot determine
 * confidently is simply left unset.
 */
export type InspirationSuggestion = {
  shape?: string;
  tierCount?: number;
  colours?: string[];
  finish?: string;
  decorationStyle?: string;
  flavour?: string;
  filling?: string;
};

export type InspirationRef = {
  /** Public URL once uploaded. */
  url: string;
  fileName: string;
  /** A Vanilla Valley gallery photo used as the reference instead. */
  gallery: GalleryInspiration | null;
  /** Populated by a later AI analysis phase; always customer-editable. */
  suggestion: InspirationSuggestion | null;
};

export const EMPTY_INSPIRATION: InspirationRef = {
  url: "",
  fileName: "",
  gallery: null,
  suggestion: null,
};

export type CustomCakeConfig = {
  kind: "custom_cake";
  occasion: string;
  /** Servings the customer asked for; null when the step was skipped. */
  requestedServings: number | null;
  tiers: CakeTierConfig[];
  /** Decoration option names chosen on the finishing-touches screen. */
  decorations: string[];
  /** Free-text candle brief — the bakery wants the customer's own words. */
  candles: string;
  figurines: FigurineRequest;
  inspiration: InspirationRef;
  /** Gender-reveal detail, only collected for baby shower cakes. */
  genderReveal: string;
  notes: string;
  /** Optional steps the customer deliberately skipped. */
  skipped: string[];
};

export type CupcakeConfig = {
  kind: "cupcakes";
  occasion: string;
  /** Catalog-driven answers (flavour, decoration…) for cupcakes. */
  selections: OrderSelection[];
  inspiration: InspirationRef;
  notes: string;
  skipped: string[];
};

export type FixedProductConfig = {
  kind: "product";
  productId: string;
  slug: string;
  /** Price at the time of adding, in cents; always sourced from admin data. */
  unitPriceCents: number | null;
  notes: string;
};

export type CartItemConfig = CustomCakeConfig | CupcakeConfig | FixedProductConfig;

export type CartItem = {
  id: string;
  type: CartItemType;
  /** Product slug this item was built from. */
  productSlug: string;
  /** Customer-facing name shown in the cart. */
  label: string;
  quantity: number;
  config: CartItemConfig;
  createdAt: string;
};

/** Contact and delivery details, captured once for the whole order. */
export type CartContact = {
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  notes: string;
};

export const EMPTY_CART_CONTACT: CartContact = {
  name: "",
  phone: "",
  email: "",
  eventDate: "",
  notes: "",
};

export const isCustomCake = (item: CartItem): item is CartItem & { config: CustomCakeConfig } =>
  item.config.kind === "custom_cake";

export const isCupcakes = (item: CartItem): item is CartItem & { config: CupcakeConfig } =>
  item.config.kind === "cupcakes";

export const isFixedProduct = (item: CartItem): item is CartItem & { config: FixedProductConfig } =>
  item.config.kind === "product";
