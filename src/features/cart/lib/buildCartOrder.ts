import { BRAND } from "@/config/brand";
import { productEmoji, productFamily } from "@/config/product-builders";
import { sizeLabelCm, type ServingSize } from "@/features/cake-builder/lib/servings";
import { tierPositionLabel } from "@/features/cake-builder/lib/tier-position";
import type { CreateOrderInput } from "@/features/orders/api/schema";
import { cartItemLines } from "./summary";
import type { CartContact, CartItem, CustomCakeConfig } from "../types";

/**
 * Cart -> persistable order.
 *
 * A cart with a cake, cupcakes and two fixed products becomes **one** order
 * with four order items, each carrying its own structured options. Nothing
 * about the shape depends on how many products are in the basket, so adding
 * item types later needs no change to persistence.
 */
export function buildCartOrderPayload(
  items: CartItem[],
  contact: CartContact,
  extra: { summary?: string | null; chart?: ServingSize[] } = {},
): CreateOrderInput {
  const chart = extra.chart ?? [];
  /* The order-level occasion is the first one any item recorded. */
  const occasion = items
    .map((item) => ("occasion" in item.config ? item.config.occasion : ""))
    .find((value) => value) as string | undefined;

  return {
    customer: { name: contact.name, phone: contact.phone, email: contact.email || "" },
    channel: "website",
    ...(occasion ? { occasion } : {}),
    eventDate: contact.eventDate || "",
    ...(contact.notes ? { customerNotes: contact.notes } : {}),
    inspirationUrl: firstInspirationUrl(items),
    aiPreviewUrl: "",
    ...(extra.summary ? { summary: extra.summary } : {}),
    items: items.map((item) => ({
      name: item.label,
      quantity: Math.max(1, item.quantity),
      ...(itemSizeLabel(item, chart) ? { sizeLabel: itemSizeLabel(item, chart)! } : {}),
      options: itemOptions(item, chart),
    })),
  };
}

function firstInspirationUrl(items: CartItem[]): string {
  for (const item of items) {
    if ("inspiration" in item.config && item.config.inspiration.url)
      return item.config.inspiration.url;
  }
  return "";
}

/** Bottom tier size stands in as the cake's headline size. */
function itemSizeLabel(item: CartItem, chart: ServingSize[]): string | null {
  if (item.config.kind !== "custom_cake") return null;
  const bottom = item.config.tiers[0];
  return bottom?.sizeCm ? sizeLabelCm(chart, bottom.sizeCm) : null;
}

/**
 * Every answer becomes a queryable option row — no new tables, and a future
 * pricing or reporting pass can read tiers back by `tierIndex` and group key.
 */
function itemOptions(
  item: CartItem,
  chart: ServingSize[],
): NonNullable<CreateOrderInput["items"][number]["options"]> {
  const options: NonNullable<CreateOrderInput["items"][number]["options"]> = [];
  const push = (
    groupKey: string,
    groupLabel: string,
    valueLabel: string,
    tierIndex: number | null = null,
  ) => {
    if (valueLabel.trim()) options.push({ groupKey, groupLabel, valueLabel, tierIndex });
  };

  if (item.config.kind === "custom_cake") {
    const config: CustomCakeConfig = item.config;
    if (config.requestedServings)
      push("servings", "Servings needed", String(config.requestedServings));
    config.tiers.forEach((tier, index) => {
      /* `tierIndex` is the bottom-first index, matching `position`. */
      const label = tierPositionLabel(index, config.tiers.length);
      if (tier.sizeCm) push("size", `${label} size`, sizeLabelCm(chart, tier.sizeCm), index);
      push("flavour", `${label} flavour`, tier.flavour, index);
      push("filling", `${label} filling`, tier.filling, index);
      push("colour", `${label} colour`, tier.colour, index);
      push("finish", `${label} finish`, tier.finish, index);
      push("shape", `${label} shape`, tier.shape, index);
      push("position", `${label} position`, tier.position, index);
    });
    config.decorations.forEach((value) => push("decoration", "Decoration", value));
    push("candles", "Candles", config.candles);
    if (config.figurines.required)
      push(
        "figurines",
        "Figurines",
        `${config.figurines.quantity} × ${config.figurines.description || "to be discussed"}`,
      );
    push("gender_reveal", "Gender reveal", config.genderReveal);
    if (config.inspiration.gallery)
      push("gallery_inspiration", "Gallery inspiration", config.inspiration.gallery.url);
    push("notes", "Additional information", config.notes);
    return options;
  }

  if (item.config.kind === "cupcakes") {
    item.config.selections.forEach((selection) =>
      options.push({
        groupKey: selection.groupKey,
        groupLabel: selection.groupLabel,
        valueKey: selection.valueKey,
        valueLabel: selection.valueLabel,
        tierIndex: null,
      }),
    );
    push("notes", "Additional information", item.config.notes);
    return options;
  }

  push("notes", "Additional information", item.config.notes);
  return options;
}

/**
 * The WhatsApp enquiry for a whole basket. Each product is its own clearly
 * separated block, so the bakery reads a four-product order as easily as a
 * single cake.
 */
export function buildCartMessage(
  items: CartItem[],
  contact: CartContact,
  extra: { orderNumber?: string | null; chart?: ServingSize[]; photoLines?: string[] } = {},
): string {
  const chart = extra.chart ?? [];
  const blocks = items.map((item, index) => {
    const emoji = productEmoji(item.productSlug);
    const heading = [emoji, `*${index + 1}. ${item.label}*`].filter(Boolean).join(" ");
    const lines = cartItemLines(item, chart).map((line) => `*${line.label}:* ${line.value}`);
    return [
      heading,
      item.quantity > 1 ? `*Quantity:* ${item.quantity}` : null,
      ...lines,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [
    `*New Order Request — ${BRAND.name}*`,
    extra.orderNumber ? `*Reference:* ${extra.orderNumber}` : null,
    ``,
    ...blocks.flatMap((block) => [block, ``]),
    contact.eventDate ? `*Date needed:* ${contact.eventDate}` : null,
    ...(extra.photoLines ?? []),
    ``,
    `*Name:* ${contact.name}`,
    `*Phone:* ${contact.phone}`,
    contact.email ? `*Email:* ${contact.email}` : null,
    contact.notes ? `\n*Notes:* ${contact.notes}` : null,
  ]
    .filter((line) => line !== null && line !== undefined)
    .join("\n");
}

/** Fallback label when a cart item is created without one. */
export const defaultItemLabel = (slug: string) => productFamily(slug).label;
