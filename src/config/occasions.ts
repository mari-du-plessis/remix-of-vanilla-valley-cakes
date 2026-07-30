/**
 * Occasion + category taxonomy.
 *
 * Order occasions and gallery categories currently share the same values, but
 * they are separate exports on purpose: they are different business concepts
 * and will diverge (e.g. gallery gains "Cupcakes", orders gain "Corporate").
 */

export const ORDER_OCCASIONS = [
  "Pretty Princesses",
  "Little Legends",
  "The Queen Collection",
  "Kings & Cake",
  "Wedding",
  "Baby Shower",
  "Bridal Shower",
  "General",
] as const;

export type OrderOccasion = (typeof ORDER_OCCASIONS)[number];

/** Categories used to tag and filter gallery photos. */
export const GALLERY_CATEGORIES = [...ORDER_OCCASIONS] as string[];

export const GALLERY_ALL_TAB = "All";

/** Legacy alias — prefer ORDER_OCCASIONS / GALLERY_CATEGORIES. */
export const OCCASIONS = ORDER_OCCASIONS;
