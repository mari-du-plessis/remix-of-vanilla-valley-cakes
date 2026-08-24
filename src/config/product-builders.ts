/**
 * Product families and their builders.
 *
 * Only the Custom Cake has a dedicated builder today. Every other product
 * family is ordered through the plain wizard until its own builder ships, so
 * nothing here assumes one rendering pipeline fits all products.
 *
 * A new builder is introduced by adding a `builder` id below and mounting the
 * matching experience — no renderer, order or messaging code needs to change.
 */

export type ProductBuilderId =
  | "cake-svg"
  | "cupcake"
  | "cheesecake"
  | "cookie"
  | "tart"
  | "cake-cup"
  | "rusk"
  | "none";

export type ProductFamily = {
  /** Product slug as stored in the catalog. */
  slug: string;
  label: string;
  /** Builder experience for this family; `none` = plain wizard. */
  builder: ProductBuilderId;
  /** Emoji used to identify the product in the WhatsApp summary. */
  emoji: string;
  /** Word used in the WhatsApp subject line. */
  noun: string;
};

/**
 * Emojis follow the bakery's rules exactly: cake 🎂, cupcakes 🧁, cookies and
 * biscuits 🍪, cheesecake 🍰 — tarts, cake cups and rusks carry none. The
 * emoji comes from this configuration, never from the product's name.
 */
export const PRODUCT_FAMILIES: ProductFamily[] = [
  { slug: "custom-cake", label: "Custom Cake", builder: "cake-svg", emoji: "🎂", noun: "Cake" },
  { slug: "cupcakes", label: "Cupcakes", builder: "cupcake", emoji: "🧁", noun: "Cupcake" },
  { slug: "cheesecake", label: "Cheesecake", builder: "cheesecake", emoji: "🍰", noun: "Cheesecake" },
  { slug: "biscuits", label: "Biscuits", builder: "cookie", emoji: "🍪", noun: "Biscuit" },
  { slug: "cookies", label: "Cookies", builder: "cookie", emoji: "🍪", noun: "Cookie" },
  { slug: "tarts", label: "Tarts", builder: "tart", emoji: "", noun: "Tart" },
  { slug: "cake-cups", label: "Cake Cups", builder: "cake-cup", emoji: "", noun: "Cake Cup" },
  { slug: "rusks", label: "Rusks", builder: "rusk", emoji: "", noun: "Rusk" },
];


const familyBySlug = new Map(PRODUCT_FAMILIES.map((f) => [f.slug, f]));

/** The custom cake is the default family: an unanswered product step still designs a cake. */
export const DEFAULT_FAMILY = familyBySlug.get("custom-cake")!;

export const productFamily = (slug: string | null | undefined): ProductFamily =>
  (slug ? familyBySlug.get(slug) : undefined) ?? DEFAULT_FAMILY;

/**
 * Builders that exist today. Only the custom cake has one, so only the custom
 * cake shows the SVG renderer, the live preview and the AI concept.
 */
export const IMPLEMENTED_BUILDERS = new Set<ProductBuilderId>(["cake-svg"]);

/** True when the SVG cake renderer applies to the chosen product. */
export const usesCakeRenderer = (slug: string | null | undefined): boolean =>
  productFamily(slug).builder === "cake-svg";

/** Product emoji for the WhatsApp summary; empty for families without one. */
export const productEmoji = (slug: string | null | undefined): string =>
  productFamily(slug).emoji;
