export type CakeTier = { flavour: string; filling: string };

export type OrderFormState = {
  occasion: string;
  size: string;
  flavour: string;
  filling: string;
  tiers: CakeTier[];
  extras: string[];
  /** Optional message piped / printed on the cake, shown live in the builder. */
  cakeText: string;
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
  size: "",
  flavour: "",
  filling: "",
  tiers: [],
  extras: [],
  cakeText: "",
  inspirationFile: null,
  inspirationPreview: "",
  eventDate: "",
  name: "",
  phone: "",
  email: "",
  notes: "",
};


export const ORDER_STEPS = ["Occasion", "Cake", "Details", "Contact"] as const;
