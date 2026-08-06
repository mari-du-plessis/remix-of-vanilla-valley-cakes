import type {
  PriceListItem,
  PricingRule,
  PricingSnapshot,
} from "../types";

/**
 * Pure pricing engine.
 *
 * Everything downstream — quotations, PDF quotes, invoices and payments —
 * calls `calculateQuote` so pricing logic never gets duplicated. It has no
 * Supabase, React or network dependency: give it a snapshot plus a request and
 * it returns a fully itemised breakdown.
 */

export type QuoteLineRequest = {
  /** Free-text description used when nothing matches a priced row. */
  name: string;
  productId?: string | null;
  sizeKey?: string | null;
  tierCount?: number | null;
  /** Servings drive `per_serving` pricing. */
  servings?: number | null;
  quantity?: number;
  /** Selected option ids — each may carry a price adjustment. */
  optionIds?: string[];
};

export type QuoteRequest = {
  lines: QuoteLineRequest[];
  /** YYYY-MM-DD, used by weekend / holiday / seasonal rules. */
  eventDate?: string | null;
  /** Days between now and the event, used by rush rules. */
  leadTimeDays?: number | null;
  delivery?: { zoneKey?: string | null; distanceKm?: number | null } | null;
  /** Public holidays (YYYY-MM-DD) supplied by the caller. */
  holidays?: string[];
};

export type QuoteLine = {
  label: string;
  detail?: string;
  quantity: number;
  unitCents: number;
  amountCents: number;
  source: "product" | "option" | "tier" | "delivery" | "rush" | "rule" | "custom";
};

export type QuoteBreakdown = {
  currency: string;
  priceListId: string;
  lines: QuoteLine[];
  subtotalCents: number;
  adjustmentsCents: number;
  totalCents: number;
  /** Set when a minimum-order rule was not met. */
  minimumOrderCents: number | null;
  shortfallCents: number;
  /** Human-readable notes, e.g. rules that were applied. */
  notes: string[];
};

const active = (item: { isActive: boolean }) => item.isActive;

const withinDates = (
  from: string | null,
  to: string | null,
  date: string | null | undefined,
) => {
  if (!date) return !from && !to;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
};

const isWeekend = (date: string) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

const findItem = (
  items: PriceListItem[],
  predicate: (item: PriceListItem) => boolean,
) => items.filter(active).find(predicate);

function lineAmount(item: PriceListItem, line: QuoteLineRequest, quantity: number) {
  switch (item.unit) {
    case "per_serving":
      return item.amountCents * (line.servings ?? 0);
    case "per_tier":
      return item.amountCents * (line.tierCount ?? 1);
    case "percentage":
      return 0; // percentages only make sense as rules, never as a base line
    default:
      return item.amountCents * quantity;
  }
}

/** Rules that currently apply, ordered by priority (highest first). */
export function applicableRules(
  rules: PricingRule[],
  request: QuoteRequest,
): PricingRule[] {
  const date = request.eventDate ?? null;
  return rules
    .filter(active)
    .filter((rule) => withinDates(rule.effectiveFrom, rule.effectiveTo, date) || !date)
    .filter((rule) => {
      const conditions = rule.conditions ?? {};
      switch (rule.ruleType) {
        case "rush_order": {
          const threshold = Number(conditions["maxLeadTimeDays"] ?? 3);
          return (
            request.leadTimeDays !== null &&
            request.leadTimeDays !== undefined &&
            request.leadTimeDays <= threshold
          );
        }
        case "weekend_surcharge":
          return Boolean(date && isWeekend(date));
        case "holiday_surcharge":
          return Boolean(date && (request.holidays ?? []).includes(date));
        case "delivery_zone":
          return Boolean(
            request.delivery?.zoneKey &&
              request.delivery.zoneKey === conditions["zoneKey"],
          );
        case "seasonal_promotion":
        case "minimum_order":
        case "custom":
        default:
          return true;
      }
    })
    .sort((a, b) => b.priority - a.priority);
}

export function calculateQuote(
  snapshot: PricingSnapshot,
  request: QuoteRequest,
): QuoteBreakdown {
  const { priceList, items, rules } = snapshot;
  const lines: QuoteLine[] = [];

  for (const line of request.lines) {
    const quantity = line.quantity ?? 1;

    const tierItem =
      line.tierCount != null
        ? findItem(
            items,
            (item) => item.targetType === "tier" && item.tierCount === line.tierCount,
          )
        : undefined;

    const productItem = findItem(
      items,
      (item) =>
        item.targetType === "product" &&
        item.productId === (line.productId ?? null) &&
        (item.sizeKey ?? null) === (line.sizeKey ?? null),
    );

    const base = productItem ?? tierItem;
    if (base) {
      const amount = lineAmount(base, line, quantity);
      lines.push({
        label: line.name,
        detail: base.label,
        quantity,
        unitCents: base.amountCents,
        amountCents: amount,
        source: productItem ? "product" : "tier",
      });
    } else {
      lines.push({
        label: line.name,
        detail: "No price captured yet",
        quantity,
        unitCents: 0,
        amountCents: 0,
        source: "custom",
      });
    }

    for (const optionId of line.optionIds ?? []) {
      const optionItem = findItem(
        items,
        (item) => item.targetType === "option" && item.optionId === optionId,
      );
      if (!optionItem || optionItem.amountCents === 0) continue;
      lines.push({
        label: optionItem.label,
        quantity,
        unitCents: optionItem.amountCents,
        amountCents: lineAmount(optionItem, line, quantity),
        source: "option",
      });
    }
  }

  // Delivery, priced either flat or per km.
  const distance = request.delivery?.distanceKm ?? null;
  if (request.delivery) {
    const deliveryItem = findItem(items, (item) => item.targetType === "delivery");
    if (deliveryItem) {
      const amount =
        deliveryItem.unit === "per_km"
          ? deliveryItem.amountCents * (distance ?? 0)
          : deliveryItem.amountCents;
      lines.push({
        label: deliveryItem.label,
        detail: deliveryItem.unit === "per_km" ? `${distance ?? 0} km` : undefined,
        quantity: 1,
        unitCents: deliveryItem.amountCents,
        amountCents: amount,
        source: "delivery",
      });
    }
  }

  const subtotalCents = lines.reduce((total, line) => total + line.amountCents, 0);

  // Rules apply on top of the subtotal, highest priority first.
  const notes: string[] = [];
  let adjustmentsCents = 0;
  let minimumOrderCents: number | null = null;

  for (const rule of applicableRules(rules, request)) {
    if (rule.ruleType === "minimum_order") {
      minimumOrderCents = rule.adjustmentValue;
      continue;
    }
    const amount =
      rule.adjustmentType === "percentage"
        ? Math.round(((subtotalCents + adjustmentsCents) * rule.adjustmentValue) / 100)
        : rule.adjustmentValue;
    if (amount === 0) continue;
    adjustmentsCents += amount;
    lines.push({
      label: rule.name,
      detail:
        rule.adjustmentType === "percentage" ? `${rule.adjustmentValue}%` : undefined,
      quantity: 1,
      unitCents: amount,
      amountCents: amount,
      source: rule.ruleType === "rush_order" ? "rush" : "rule",
    });
    notes.push(rule.name);
  }

  const totalCents = subtotalCents + adjustmentsCents;

  return {
    currency: priceList.currency,
    priceListId: priceList.id,
    lines,
    subtotalCents,
    adjustmentsCents,
    totalCents,
    minimumOrderCents,
    shortfallCents:
      minimumOrderCents && totalCents < minimumOrderCents
        ? minimumOrderCents - totalCents
        : 0,
    notes,
  };
}
