import type { ComboboxOption } from "@/components/common";
import { centsToAmount } from "@/features/pricing/lib/money";
import { PRICE_UNIT_LABELS } from "@/features/pricing/types";
import type { PriceListItem } from "@/features/pricing/types";
import type { QuoteLineKind } from "../types";

/** Price list target types map 1:1 onto quote line kinds. */
export function kindForPriceListItem(item: PriceListItem): QuoteLineKind {
  switch (item.targetType) {
    case "product":
      return "product";
    case "option":
      return "option";
    case "tier":
      return "tier";
    case "delivery":
      return "delivery";
    case "rush":
      return "rush";
    case "service":
      return "service";
    default:
      return "custom";
  }
}

/** The values a quote line inherits when a price list item is chosen. */
export function lineValuesFromPriceListItem(item: PriceListItem) {
  return {
    priceListItemId: item.id,
    kind: kindForPriceListItem(item),
    label: item.label,
    detail: PRICE_UNIT_LABELS[item.unit],
    quantity: Math.max(1, item.minQuantity || 1),
    unitCents: item.amountCents,
  };
}

/** Searchable options for the quote description picker. */
export function priceListItemOptions(items: PriceListItem[]): ComboboxOption[] {
  return items
    .filter((item) => item.isActive)
    .map((item) => ({
      value: item.id,
      label: item.label,
      hint: `${PRICE_UNIT_LABELS[item.unit]} · ${centsToAmount(item.amountCents)}`,
      keywords: `${item.targetType} ${item.notes ?? ""}`,
    }));
}
