import { z } from "zod";

/** Appearance tokens are short, kebab-case keys such as `decor-bow`. */
export const generateAssetSchema = z.object({
  token: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Token must be lowercase, kebab-case"),
  label: z.string().trim().min(1).max(80),
  /** Rendering slot, so the prompt can describe how the piece will be placed. */
  slot: z.string().trim().min(1).max(32),
});

export type GenerateAssetInput = z.infer<typeof generateAssetSchema>;
