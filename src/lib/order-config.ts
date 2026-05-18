// WhatsApp number for Vanilla Valley Bakery (international format, no +).
// South African default — bakery owner can change this number.
export const WHATSAPP_NUMBER = "27784210783";
export const BAKERY_NAME = "Vanilla Valley";

export const OCCASIONS = [
  "Pretty Princesses",
  "Little Legends",
  "The Queen Collection",
  "Kings & Cake",
  "Wedding",
  "Baby Shower",
  "Bridal Shower",
  "General",
] as const;

export const SIZES = [
  { id: "6", label: '6" Round', serves: "Serves 8–10" },
  { id: "8", label: '8" Round', serves: "Serves 12–15" },
  { id: "10", label: '10" Round', serves: "Serves 20–25" },
  { id: "tier2", label: "2 Tier", serves: "Serves 30–40" },
  { id: "tier3", label: "3 Tier", serves: "Serves 60–80" },
  { id: "cupcakes", label: "Cupcakes", serves: "Per dozen" },
];

// Fillings available for "custom" flavours (Category A)
export const FILLINGS = [
  "Vanilla Buttercream",
  "Chocolate Ganache",
  "Salted Caramel",
  "Fresh Cream",
  "Fresh Cream & Berries",
  "Cream Cheese",
];

// Each flavour either lets the customer pick a filling (pairing: null)
// or comes with a signature pairing (pairing: string).
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

export const EXTRAS = [
  "Fresh flowers", "Edible gold leaf", "Custom topper",
  "Personalised message", "Macarons on top", "Drip effect", "Candles included",
];
