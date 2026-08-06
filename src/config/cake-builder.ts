/**
 * Cake builder appearance tokens.
 *
 * Every option in the catalog can be mapped to a visual token the SVG cake
 * builder understands. The bakery owner picks a token from a list instead of
 * typing a raw string, so an option added in the admin panel can immediately
 * change the illustration.
 *
 * Tokens are grouped by the option group they normally belong to; the editor
 * shows the matching group first and still allows any token.
 */

export type AppearanceToken = {
  value: string;
  label: string;
  /** Option group key this token is normally used with. */
  group: AppearanceGroupKey;
};

export type AppearanceGroupKey =
  | "shape"
  | "size"
  | "flavour"
  | "filling"
  | "icing"
  | "decoration";

export const APPEARANCE_GROUP_LABELS: Record<AppearanceGroupKey, string> = {
  shape: "Shape",
  size: "Size & tiers",
  flavour: "Sponge colour",
  filling: "Filling colour",
  icing: "Icing finish",
  decoration: "Decoration",
};

export const APPEARANCE_TOKENS: AppearanceToken[] = [
  // Shape
  { value: "shape-round", label: "Round", group: "shape" },
  { value: "shape-square", label: "Square", group: "shape" },
  { value: "shape-heart", label: "Heart", group: "shape" },
  { value: "shape-number", label: "Number", group: "shape" },
  { value: "shape-sheet", label: "Sheet / slab", group: "shape" },

  // Size / tiers
  { value: "size-single", label: "Single layer", group: "size" },
  { value: "size-double", label: "Double layer", group: "size" },
  { value: "size-two-tier", label: "Two tiers", group: "size" },
  { value: "size-three-tier", label: "Three tiers", group: "size" },
  { value: "size-four-tier", label: "Four tiers", group: "size" },

  // Sponge colours
  { value: "sponge-vanilla", label: "Vanilla sponge", group: "flavour" },
  { value: "sponge-chocolate", label: "Chocolate sponge", group: "flavour" },
  { value: "sponge-red-velvet", label: "Red velvet sponge", group: "flavour" },
  { value: "sponge-carrot", label: "Carrot sponge", group: "flavour" },
  { value: "sponge-lemon", label: "Lemon sponge", group: "flavour" },

  // Fillings
  { value: "filling-cream", label: "Cream filling", group: "filling" },
  { value: "filling-chocolate", label: "Chocolate filling", group: "filling" },
  { value: "filling-fruit", label: "Fruit filling", group: "filling" },
  { value: "filling-caramel", label: "Caramel filling", group: "filling" },

  // Icing finishes
  { value: "icing-smooth", label: "Smooth buttercream", group: "icing" },
  { value: "icing-textured", label: "Textured buttercream", group: "icing" },
  { value: "icing-fondant", label: "Fondant", group: "icing" },
  { value: "icing-naked", label: "Semi-naked", group: "icing" },

  // Decorations
  { value: "decor-drip", label: "Drip", group: "decoration" },
  { value: "decor-gold-leaf", label: "Gold leaf", group: "decoration" },
  { value: "decor-fresh-flowers", label: "Fresh flowers", group: "decoration" },
  { value: "decor-sugar-flowers", label: "Sugar flowers", group: "decoration" },
  { value: "decor-macarons", label: "Macarons", group: "decoration" },
  { value: "decor-sprinkles", label: "Sprinkles", group: "decoration" },
  { value: "decor-pearls", label: "Pearls", group: "decoration" },
  { value: "decor-topper", label: "Cake topper", group: "decoration" },
  { value: "decor-candles", label: "Candles", group: "decoration" },
  { value: "decor-berries", label: "Fresh berries", group: "decoration" },
  { value: "decor-bow", label: "Ribbon bow", group: "decoration" },
];

/** Tokens for one option group key, most relevant first. */
export function appearanceTokensFor(groupKey?: string | null): AppearanceToken[] {
  const key = (groupKey ?? "").toLowerCase();
  const matches = APPEARANCE_TOKENS.filter((token) => token.group === key);
  const rest = APPEARANCE_TOKENS.filter((token) => token.group !== key);
  return [...matches, ...rest];
}

export const appearanceLabel = (token: string | null | undefined) =>
  APPEARANCE_TOKENS.find((entry) => entry.value === token)?.label ?? token ?? null;
