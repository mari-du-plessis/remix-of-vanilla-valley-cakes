import { EMPTY_APPEARANCE, type CakeAppearance } from "@/features/cake-builder/lib/appearance";

export type CakeTier = { flavour: string; filling: string };

export type OrderFormState = {
  occasion: string;
  /** Product slug chosen in the cake builder (celebration cake, cupcakes…). */
  product: string;
  /** Asset key of the chosen silhouette, e.g. `shape-round`. */
  shapeKey: string;
  /** Asset key of the chosen finish, e.g. `icing-smooth`. */
  icingKey: string;
  size: string;
  flavour: string;
  filling: string;
  tiers: CakeTier[];
  extras: string[];
  /**
   * Custom cake appearance: colour treatment, per-tier colours, decoration
   * colours and topper detail. Structure and options stay in the fields above
   * and in the catalog — see `features/cake-builder/lib/appearance.ts`.
   */
  appearance: CakeAppearance;
  /** Optional message piped / printed on the cake, shown live in the builder. */
  cakeText: string;
  /** AI inspiration illustration generated on request in the builder. */
  aiPreviewUrl: string;
  /** Fingerprint of the design the AI preview was generated from. */
  aiPreviewSignature: string;
  inspirationFile: File | null;
  inspirationPreview: string;
  eventDate: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export const EMPTY_ORDER_FORM: OrderFormState = {
  occasion: "",
  product: "",
  shapeKey: "",
  icingKey: "",
  size: "",
  flavour: "",
  filling: "",
  tiers: [],
  extras: [],
  appearance: EMPTY_APPEARANCE,
  cakeText: "",
  aiPreviewUrl: "",
  aiPreviewSignature: "",
  inspirationFile: null,
  inspirationPreview: "",
  eventDate: "",
  name: "",
  phone: "",
  email: "",
  notes: "",
};



export const ORDER_STEPS = ["Occasion", "Cake", "Details", "Contact"] as const;
