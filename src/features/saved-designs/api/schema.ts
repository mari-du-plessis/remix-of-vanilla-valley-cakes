import { z } from "zod";

/** Validation contracts for Saved Designs (client + server safe). */

const trimmed = (max: number) => z.string().trim().max(max);

/** Opaque device key; long enough to act as the row's bearer secret. */
export const ownerKeySchema = trimmed(128).min(16, "Missing owner key");

const colourSchema = z.object({
  name: z.string().max(120).default(""),
  hex: z.string().max(20).nullable().optional(),
});

const appearanceSchema = z
  .object({
    treatment: z.enum(["solid", "ombre", "fault-line"]).default("solid"),
    tiers: z.array(z.object({ colour: colourSchema })).max(10).default([]),
    decorations: z.record(z.string(), colourSchema.nullable()).default({}),
    topper: z
      .object({ style: z.string().max(200).default(""), wording: z.string().max(200).default("") })
      .default({ style: "", wording: "" }),
  })
  .passthrough();

const templateReferenceSchema = z
  .object({ id: z.string().uuid(), slug: trimmed(160), name: trimmed(120) })
  .nullable();

const galleryInspirationSchema = z
  .object({
    id: z.string(),
    imagePath: z.string(),
    url: z.string(),
    caption: z.string().nullable(),
    category: z.string().nullable(),
    source: z.literal("gallery"),
  })
  .nullable();

export const designSnapshotSchema = z.object({
  occasion: trimmed(120).default(""),
  product: trimmed(120).default(""),
  shapeKey: trimmed(120).default(""),
  icingKey: trimmed(120).default(""),
  size: trimmed(120).default(""),
  flavour: trimmed(120).default(""),
  filling: trimmed(120).default(""),
  tiers: z
    .array(z.object({ flavour: trimmed(120).default(""), filling: trimmed(120).default("") }))
    .max(10)
    .default([]),
  extras: z.array(trimmed(120)).max(40).default([]),
  appearance: appearanceSchema,
  cakeText: trimmed(200).default(""),
  galleryInspiration: galleryInspirationSchema.default(null),
  templateRef: templateReferenceSchema.default(null),
  inspirationImageUrl: trimmed(600).default(""),
});

export const listSavedDesignsSchema = z.object({
  ownerKey: ownerKeySchema,
  status: z.enum(["active", "archived", "all"]).default("active"),
});

export const savedDesignIdSchema = z.object({
  ownerKey: ownerKeySchema,
  id: z.string().uuid(),
});

export const saveDesignSchema = z.object({
  ownerKey: ownerKeySchema,
  /** Present when updating an existing design ("Edit design"). */
  id: z.string().uuid().nullable().optional(),
  name: trimmed(80).min(1, "Please name your design"),
  design: designSnapshotSchema,
  aiPreviewUrl: trimmed(600).nullable().optional(),
  aiPreviewSignature: trimmed(2000).nullable().optional(),
  sourceOrderId: z.string().uuid().nullable().optional(),
  sourceTemplateId: z.string().uuid().nullable().optional(),
});

export const renameSavedDesignSchema = savedDesignIdSchema.extend({
  name: trimmed(80).min(1, "Please name your design"),
});

export const archiveSavedDesignSchema = savedDesignIdSchema.extend({
  status: z.enum(["active", "archived"]),
});

export type SaveDesignInput = z.infer<typeof saveDesignSchema>;
export type DesignSnapshotInput = z.infer<typeof designSnapshotSchema>;
