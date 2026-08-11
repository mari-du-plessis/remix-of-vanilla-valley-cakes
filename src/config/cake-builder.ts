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
  { value: "icing-ombre", label: "Ombre", group: "icing" },
  { value: "icing-fault-line", label: "Fault line", group: "icing" },

  // Decorations
  { value: "decor-drip", label: "Drip", group: "decoration" },
  { value: "decor-gold-leaf", label: "Gold leaf", group: "decoration" },
  { value: "decor-rose-gold-leaf", label: "Rose gold leaf", group: "decoration" },
  { value: "decor-silver-leaf", label: "Silver leaf", group: "decoration" },
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

/* ------------------------------ colour palette ----------------------------- */

/**
 * Default CSS custom properties handed to the SVG cake illustration. Assets
 * paint with `var(--cake-*)` so a single colour change re-themes every piece.
 */
export const CAKE_COLOR_DEFAULTS: Record<string, string> = {
  "--cake-icing": "#f4ebdf",
  "--cake-shade": "#2a2320",
  "--cake-sponge": "#d8b184",
  "--cake-filling": "#f7e8d4",
  "--cake-drip": "#4a2f26",
  "--cake-gold": "#c19a3d",
  "--cake-leaf": "#5f7a52",
  "--cake-flower": "#e8d5cf",
  "--cake-flower-alt": "#f4e6e1",
  "--cake-berry": "#7a2233",
  "--cake-pearl": "#efe6da",
  "--cake-macaron": "#e9c3c8",
  "--cake-topper": "#c19a3d",
  "--cake-fault": "#c19a3d",
  "--cake-accent": "#b8895f",
  "--cake-wood": "#c69a67",
  "--cake-wood-dark": "#a8794b",
};

const SPONGE_COLOURS: Record<string, string> = {
  vanilla: "#e8cfa2",
  chocolate: "#6b4429",
  "red velvet": "#9c3324",
  carrot: "#c98a4b",
  lemon: "#efd97a",
  "lemon poppy": "#ecd98a",
  coffee: "#7b5638",
  funfetti: "#f2ddc2",
  amarula: "#a5754a",
  hummingbird: "#d2a86f",
  "spicy pumpkin": "#d08b45",
};

const FILLING_COLOURS: Record<string, string> = {
  "vanilla buttercream": "#f8ecd8",
  "chocolate ganache": "#503020",
  "salted caramel": "#c8873f",
  "fresh cream": "#fbf4e8",
  "fresh cream & berries": "#f0cdd2",
  "cream cheese": "#f7f0e2",
};

const lookup = (table: Record<string, string>, name: string, fallback: string) => {
  const key = name.trim().toLowerCase();
  if (table[key]) return table[key];
  const partial = Object.keys(table).find((k) => key.includes(k) || k.includes(key));
  return (partial && table[partial]) || fallback;
};

export const spongeColour = (flavour: string) =>
  flavour ? lookup(SPONGE_COLOURS, flavour, CAKE_COLOR_DEFAULTS["--cake-sponge"]!) : CAKE_COLOR_DEFAULTS["--cake-sponge"]!;

export const fillingColour = (filling: string) =>
  filling ? lookup(FILLING_COLOURS, filling, CAKE_COLOR_DEFAULTS["--cake-filling"]!) : CAKE_COLOR_DEFAULTS["--cake-filling"]!;
