import { EMPTY_APPEARANCE, type CakeAppearance } from "@/features/cake-builder/lib/appearance";
import type { GalleryInspiration } from "@/features/gallery/lib/inspiration-reference";

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
  /**
   * A Vanilla Valley gallery photo the customer picked as a reference. Kept
   * separate from `inspirationFile` so the bakery — and future Saved Designs —
   * always know whether an image is ours or the customer's own.
   */
  galleryInspiration: GalleryInspiration | null;
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
  galleryInspiration: null,
  eventDate: "",
  name: "",
  phone: "",
  email: "",
  notes: "",
};



export const ORDER_STEPS = ["Occasion", "Cake", "Details", "Contact"] as const;
