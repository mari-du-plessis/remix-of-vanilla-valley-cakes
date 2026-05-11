// WhatsApp number for Vanilla Valley Bakery (international format, no +).
// South African default — bakery owner can change this number.
export const WHATSAPP_NUMBER = "27812345678";
export const BAKERY_NAME = "Vanilla Valley";

export const OCCASIONS = [
  "Birthday", "Wedding", "Anniversary", "Baby Shower",
  "Bridal Shower", "Engagement", "Baptism", "Corporate", "Other",
] as const;

export const SIZES = [
  { id: "6", label: '6" Round', serves: "Serves 8–10" },
  { id: "8", label: '8" Round', serves: "Serves 12–15" },
  { id: "10", label: '10" Round', serves: "Serves 20–25" },
  { id: "tier2", label: "2 Tier", serves: "Serves 30–40" },
  { id: "tier3", label: "3 Tier", serves: "Serves 60–80" },
  { id: "cupcakes", label: "Cupcakes", serves: "Per dozen" },
];

export const FLAVOURS = [
  "Vanilla Sponge", "Chocolate", "Red Velvet", "Lemon",
  "Carrot", "Funfetti", "Coffee", "Marble",
];

export const FILLINGS = [
  "Vanilla Buttercream", "Chocolate Ganache", "Cream Cheese",
  "Strawberry Jam", "Salted Caramel", "Lemon Curd", "Fresh Cream & Berries",
];

export const EXTRAS = [
  "Fresh flowers", "Edible gold leaf", "Custom topper",
  "Personalised message", "Macarons on top", "Drip effect", "Candles included",
];
