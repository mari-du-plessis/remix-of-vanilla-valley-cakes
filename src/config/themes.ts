/**
 * Theme registry.
 *
 * A theme is purely presentational: a named set of design tokens defined in
 * src/styles.css under a `[data-theme="<id>"]` block. Business logic, data and
 * routing never read from here — only the ThemeProvider does.
 *
 * Adding a future theme:
 *  1. add a `[data-theme="<id>"]` token block in src/styles.css
 *  2. add an entry below
 * No component or business-logic changes are required.
 */

export type ThemeId = "classic" | "luxury";

export type ThemeDefinition = {
  id: ThemeId;
  /** Human label used in admin / theme switchers. */
  label: string;
  description: string;
  /** Colour scheme hint for form controls, scrollbars, etc. */
  colorScheme: "light" | "dark";
};

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  classic: {
    id: "classic",
    label: "Classic",
    description:
      "The original Vanilla Valley identity — warm cream backgrounds, soft rose accents and light surfaces.",
    colorScheme: "light",
  },
  luxury: {
    id: "luxury",
    label: "Luxury",
    description:
      "Matte black canvas with rich wood browns, fresh natural greens and warm metallic gold. Elegant, minimal and premium.",
    colorScheme: "dark",
  },
};

export const THEME_LIST: ThemeDefinition[] = Object.values(THEMES);

/** Theme used by the customer-facing website. */
export const DEFAULT_PUBLIC_THEME: ThemeId = "luxury";

/** Theme used by the admin panel (kept classic for readability at density). */
export const DEFAULT_ADMIN_THEME: ThemeId = "classic";

export const isThemeId = (value: string | null | undefined): value is ThemeId =>
  !!value && value in THEMES;
