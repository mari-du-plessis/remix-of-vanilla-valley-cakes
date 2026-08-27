import { MAX_TIERS } from "@/features/cake-builder/lib/geometry";
import { EMPTY_ORDER_FORM, type OrderFormState } from "@/features/order/types";
import type { SavedDesignSnapshot } from "../types";

/**
 * Order form ⇄ saved design snapshot.
 *
 * The single place that knows which parts of the wizard belong to the *design*
 * (kept) and which belong to a particular *enquiry* — name, phone, email,
 * event date, notes and the in-memory File object — which are deliberately
 * never persisted with a design.
 */

export function toSnapshot(form: OrderFormState, inspirationImageUrl = ""): SavedDesignSnapshot {
  return {
    occasion: form.occasion,
    product: form.product,
    shapeKey: form.shapeKey,
    icingKey: form.icingKey,
    size: form.size,
    flavour: form.flavour,
    filling: form.filling,
    tiers: form.tiers.map((t) => ({ flavour: t.flavour, filling: t.filling })),
    extras: [...form.extras],
    appearance: form.appearance,
    cakeText: form.cakeText,
    galleryInspiration: form.galleryInspiration,
    templateRef: form.templateRef,
    inspirationImageUrl: inspirationImageUrl || "",
  };
}

/** Rebuilds a wizard-ready form state from a stored snapshot. */
export function snapshotToForm(
  snapshot: SavedDesignSnapshot,
  extras?: { aiPreviewUrl?: string | null; aiPreviewSignature?: string | null },
): OrderFormState {
  return {
    ...EMPTY_ORDER_FORM,
    occasion: snapshot.occasion ?? "",
    product: snapshot.product ?? "",
    shapeKey: snapshot.shapeKey ?? "",
    icingKey: snapshot.icingKey ?? "",
    size: snapshot.size ?? "",
    flavour: snapshot.flavour ?? "",
    filling: snapshot.filling ?? "",
    /**
     * Designs saved before the bakery confirmed a five-tier maximum can hold
     * more tiers than the bakery makes. They are trimmed to the supported
     * range on open rather than crashing the renderer or being silently
     * rewritten in storage.
     */
    tiers: (snapshot.tiers ?? []).slice(0, MAX_TIERS),

    extras: snapshot.extras ?? [],
    appearance: snapshot.appearance ?? EMPTY_ORDER_FORM.appearance,
    cakeText: snapshot.cakeText ?? "",
    galleryInspiration: snapshot.galleryInspiration ?? null,
    templateRef: snapshot.templateRef ?? null,
    aiPreviewUrl: extras?.aiPreviewUrl ?? "",
    aiPreviewSignature: extras?.aiPreviewSignature ?? "",
  };
}

/**
 * Fingerprint of the design an AI concept was generated from, so a preserved
 * concept is only reused while it still matches the configuration.
 */
export function designSignature(snapshot: SavedDesignSnapshot): string {
  const {
    galleryInspiration: _gallery,
    inspirationImageUrl: _url,
    templateRef: _template,
    ...design
  } = snapshot;
  return JSON.stringify(design);
}

/** A short human summary used on design cards. */
export function describeSnapshot(snapshot: SavedDesignSnapshot): string {
  const tiers = snapshot.tiers.length || 1;
  const flavours = (
    snapshot.tiers.length ? snapshot.tiers.map((t) => t.flavour) : [snapshot.flavour]
  ).filter(Boolean);
  const parts = [
    `${tiers} tier${tiers === 1 ? "" : "s"}`,
    ...(flavours.length ? [Array.from(new Set(flavours)).join(", ")] : []),
    ...(snapshot.extras.length ? [`${snapshot.extras.length} extras`] : []),
  ];
  return parts.join(" · ");
}
