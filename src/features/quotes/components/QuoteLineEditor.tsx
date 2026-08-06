import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComboboxField } from "@/components/common";
import { centsToAmount, formatCents, parseAmountToCents } from "@/features/pricing/lib/money";
import type { PriceListItem } from "@/features/pricing/types";
import { lineValuesFromPriceListItem, priceListItemOptions } from "../lib/price-list-lines";
import { QUOTE_LINE_KIND_LABELS } from "../types";
import type { QuoteLineItem, QuoteLineKind } from "../types";

export type QuoteLineEdit = {
  label?: string;
  detail?: string | null;
  kind?: QuoteLineKind;
  quantity?: number;
  unitCents?: number;
  priceListItemId?: string | null;
};

/**
 * Editable line table for a quote. Descriptions always come from the price
 * list attached to the quote — the pricing module stays the single source of
 * truth — while quantity and unit price remain editable per quote.
 */
export function QuoteLineEditor({
  lines,
  currency,
  priceListItems,
  readOnly,
  onUpdate,
  onDelete,
  onAdd,
  busy,
}: {
  lines: QuoteLineItem[];
  currency: string;
  priceListItems: PriceListItem[];
  readOnly?: boolean;
  onUpdate: (id: string, values: QuoteLineEdit) => void;
  onDelete: (id: string) => void;
  onAdd: (values: {
    label: string;
    detail: string | null;
    kind: QuoteLineKind;
    quantity: number;
    unitCents: number;
    priceListItemId: string;
  }) => void;
  busy?: boolean;
}) {
  const options = priceListItemOptions(priceListItems);
  const byId = new Map(priceListItems.map((item) => [item.id, item]));

  const [draftItemId, setDraftItemId] = useState<string | null>(null);
  const [draftQuantity, setDraftQuantity] = useState("1");
  const [draftAmount, setDraftAmount] = useState("0.00");

  const selectDraftItem = (id: string) => {
    const item = byId.get(id);
    setDraftItemId(id);
    if (item) {
      setDraftQuantity(String(Math.max(1, item.minQuantity || 1)));
      setDraftAmount(centsToAmount(item.amountCents));
    }
  };

  const submitDraft = () => {
    const item = draftItemId ? byId.get(draftItemId) : null;
    if (!item) return;
    const base = lineValuesFromPriceListItem(item);
    onAdd({
      ...base,
      quantity: Math.max(1, Number.parseInt(draftQuantity, 10) || 1),
      unitCents: parseAmountToCents(draftAmount),
      priceListItemId: item.id,
    });
    setDraftItemId(null);
    setDraftQuantity("1");
    setDraftAmount("0.00");
  };

  return (
    <div className="space-y-3">
      <div className="hidden gap-3 px-1 text-xs text-muted-foreground sm:grid sm:grid-cols-[1fr_130px_70px_110px_100px_40px]">
        <span>Description</span>
        <span>Type</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Unit</span>
        <span className="text-right">Amount</span>
        <span />
      </div>

      {lines.map((line) => (
        <div
          key={line.id}
          className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_130px_70px_110px_100px_40px] sm:items-center sm:border-0 sm:p-1"
        >
          <div className="min-w-0 space-y-1">
            <ComboboxField
              value={line.priceListItemId}
              options={options}
              disabled={readOnly}
              aria-label={`Description for ${line.label}`}
              placeholder={line.label}
              searchPlaceholder="Search the price list…"
              emptyMessage="Not in this price list — add it in Pricing first."
              onChange={(id) => {
                const item = byId.get(id);
                if (item) onUpdate(line.id, lineValuesFromPriceListItem(item));
              }}
            />
            {line.detail && <p className="px-1 text-xs text-muted-foreground">{line.detail}</p>}
          </div>

          <span className="px-1 text-xs text-muted-foreground">
            {QUOTE_LINE_KIND_LABELS[line.kind]}
          </span>

          <Input
            key={`${line.id}-qty`}
            type="number"
            min={1}
            className="text-right"
            defaultValue={line.quantity}
            disabled={readOnly}
            onBlur={(event) => {
              const quantity = Math.max(1, Number.parseInt(event.target.value, 10) || 1);
              if (quantity !== line.quantity) onUpdate(line.id, { quantity });
            }}
          />

          <Input
            key={`${line.id}-unit`}
            className="text-right"
            defaultValue={centsToAmount(line.unitCents)}
            disabled={readOnly}
            onBlur={(event) => {
              const unitCents = parseAmountToCents(event.target.value);
              if (unitCents !== line.unitCents) onUpdate(line.id, { unitCents });
            }}
          />

          <span className="text-right text-sm font-medium">
            {formatCents(line.amountCents, currency)}
          </span>

          <div className="flex justify-end">
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${line.label}`}
                disabled={busy}
                onClick={() => onDelete(line.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {!readOnly && (
        <div className="grid gap-3 rounded-xl border border-dashed border-border p-3 sm:grid-cols-[1fr_130px_70px_110px_100px_40px] sm:items-center">
          <ComboboxField
            value={draftItemId}
            options={options}
            aria-label="Add a price list item"
            placeholder="Choose from the price list…"
            searchPlaceholder="Search the price list…"
            emptyMessage="Not in this price list — add it in Pricing first."
            onChange={selectDraftItem}
          />
          <span className="px-1 text-xs text-muted-foreground">
            {draftItemId && byId.has(draftItemId)
              ? QUOTE_LINE_KIND_LABELS[
                  lineValuesFromPriceListItem(byId.get(draftItemId)!).kind
                ]
              : "—"}
          </span>
          <Input
            type="number"
            min={1}
            className="text-right"
            value={draftQuantity}
            onChange={(event) => setDraftQuantity(event.target.value)}
          />
          <Input
            className="text-right"
            value={draftAmount}
            onChange={(event) => setDraftAmount(event.target.value)}
          />
          <span className="hidden sm:block" />
          <Button
            size="icon"
            aria-label="Add line"
            disabled={!draftItemId || busy}
            onClick={submitDraft}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {options.length === 0 && !readOnly && (
        <p className="px-1 text-xs text-muted-foreground">
          This price list has no active items yet. Add them in the Pricing module before
          quoting.
        </p>
      )}
    </div>
  );
}
