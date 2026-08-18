import type { OrderSelection } from "../types";

/**
 * Pure helpers for product option selections.
 *
 * Selections are stored as self-describing rows (group + value, both key and
 * label) so the WhatsApp summary, the saved order and any future quotation can
 * read them without knowing anything about a specific product family.
 */

export function toggleSelection(
  current: OrderSelection[],
  selection: OrderSelection,
  multi: boolean,
): OrderSelection[] {
  const already = current.some(
    (s) => s.groupKey === selection.groupKey && s.valueKey === selection.valueKey,
  );

  if (!multi) {
    const others = current.filter((s) => s.groupKey !== selection.groupKey);
    /* Tapping the chosen answer again clears it. */
    return already ? others : [...others, selection];
  }

  return already
    ? current.filter(
        (s) => !(s.groupKey === selection.groupKey && s.valueKey === selection.valueKey),
      )
    : [...current, selection];
}

export const isSelected = (
  current: OrderSelection[],
  groupKey: string,
  valueKey: string,
): boolean => current.some((s) => s.groupKey === groupKey && s.valueKey === valueKey);

/** True when every required group has at least one answer. */
export const hasRequiredSelections = (
  current: OrderSelection[],
  requiredGroupKeys: string[],
): boolean => requiredGroupKeys.every((key) => current.some((s) => s.groupKey === key));

/**
 * Selections grouped for display, in the order the groups were answered.
 * Used by the WhatsApp summary so each group appears once.
 */
export function selectionSummary(
  current: OrderSelection[],
): { label: string; value: string }[] {
  const order: string[] = [];
  const byGroup = new Map<string, { label: string; values: string[] }>();
  for (const s of current) {
    if (!byGroup.has(s.groupKey)) {
      byGroup.set(s.groupKey, { label: s.groupLabel, values: [] });
      order.push(s.groupKey);
    }
    byGroup.get(s.groupKey)!.values.push(s.valueLabel);
  }
  return order.map((key) => {
    const entry = byGroup.get(key)!;
    return { label: entry.label, value: entry.values.join(", ") };
  });
}
