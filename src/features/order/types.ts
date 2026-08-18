import { EMPTY_APPEARANCE, type CakeAppearance } from "@/features/cake-builder/lib/appearance";
import type { GalleryInspiration } from "@/features/gallery/lib/inspiration-reference";
import type { TemplateReference } from "@/features/cake-templates/lib/reference";

export type CakeTier = { flavour: string; filling: string };

/**
 * One answer to a catalog option group (flavour, size, decoration…). Stored
 * self-describing — key *and* label — so the summary, the saved order and any
 * future quotation read it without knowing the product family.
 */
export type OrderSelection = {
  groupKey: string;
  groupLabel: string;
  valueKey: string;
  valueLabel: string;
};

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
  /**
   * The Vanilla Valley template this design started from, when any. Identity
   * only — the configuration above is the customer's own copy, so editing it
   * never touches the template and deleting the template never affects them.
   */
  templateRef: TemplateReference | null;
  /**
   * Answers to the chosen product's option groups (cupcakes, cheesecakes,
   * biscuits, rusks, cake cups, tarts). Empty for the Custom Cake workflow,
   * which records its design in the fields above instead.
   */
  selections: OrderSelection[];
  /** How many the customer wants, in the family's own unit (dozen, packs…). */
  quantity: number;
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
  templateRef: null,
  selections: [],
  quantity: 1,
  eventDate: "",
  name: "",
  phone: "",
  email: "",
  notes: "",
};

