/**
 * Product catalogue configuration.
 *
 * Every entry is keyed by a stable `id` so that when sizes/flavours/fillings
 * move into the database (product & pricing management module), consumers can
 * keep working against the same shape without a rewrite.
 */

export type CakeSize = {
  id: string;
  label: string;
  serves: string;
  /** Number of individually configurable tiers. 0 = single cake. */
  tiers: number;
};

export const SIZES: CakeSize[] = [
  { id: "6", label: '6" Round', serves: "Serves 8–10", tiers: 0 },
  { id: "8", label: '8" Round', serves: "Serves 12–15", tiers: 0 },
  { id: "10", label: '10" Round', serves: "Serves 20–25", tiers: 0 },
  { id: "tier2", label: "2 Tier", serves: "Serves 30–40", tiers: 2 },
  { id: "tier3", label: "3 Tier", serves: "Serves 60–80", tiers: 3 },
  { id: "cupcakes", label: "Cupcakes", serves: "Per dozen", tiers: 0 },
];

export const getSize = (id: string): CakeSize | undefined =>
  SIZES.find((s) => s.id === id);

export const getSizeLabel = (id: string): string => getSize(id)?.label ?? id;

/** How many configurable tiers a given size has. */
export const getTierCount = (sizeId: string): number => getSize(sizeId)?.tiers ?? 0;

/** Fillings selectable when a flavour has no signature pairing. */
export const FILLINGS: string[] = [
  "Vanilla Buttercream",
  "Chocolate Ganache",
  "Salted Caramel",
  "Fresh Cream",
  "Fresh Cream & Berries",
  "Cream Cheese",
];

/**
 * A flavour either lets the customer pick a filling (`pairing: null`)
 * or arrives with its signature pairing.
 */
export type Flavour = { name: string; pairing: string | null };

export const FLAVOURS: Flavour[] = [
  { name: "Vanilla", pairing: null },
  { name: "Chocolate", pairing: null },
  { name: "Red Velvet", pairing: "Cream Cheese" },
  { name: "Carrot", pairing: "Cream Cheese" },
  { name: "Spicy Pumpkin", pairing: "Cream Cheese and Salted Caramel" },
  { name: "Funfetti", pairing: null },
  { name: "Lemon", pairing: "Cream Cheese" },
  { name: "Lemon Poppy", pairing: "Cream Cheese" },
  { name: "Coffee", pairing: null },
  { name: "Amarula", pairing: "Amarula Chocolate Ganache" },
  { name: "Hummingbird", pairing: "Cream Cheese" },
];

export const getPairing = (flavourName: string): string | null =>
  FLAVOURS.find((f) => f.name === flavourName)?.pairing ?? null;

export const EXTRAS: string[] = [
  "Fresh flowers",
  "Edible gold leaf",
  "Custom topper",
  "Personalised message",
  "Macarons on top",
  "Drip effect",
  "Candles included",
];
