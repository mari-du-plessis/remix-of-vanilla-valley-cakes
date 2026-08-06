import { useMemo } from "react";
import { AdminSection } from "@/features/admin/components/AdminSection";
import { CatalogCrudList } from "@/features/admin/catalog/CatalogCrudList";
import {
  FormActions,
  NativeSelectField,
  TextField,
  ToggleField,
  useFormState,
} from "@/features/admin/catalog/fields";
import { useAllOptions, useOptionGroups, useProducts } from "@/features/catalog/hooks/useCatalog";
import { centsToAmount, formatCents, parseAmountToCents } from "@/features/pricing/lib/money";
import {
  PRICE_TARGET_LABELS,
  PRICE_UNIT_LABELS,
  type PriceListItem,
  type PriceTargetType,
} from "@/features/pricing/types";
import type { PriceListItemInput } from "@/features/pricing/api/schema";

const TARGET_OPTIONS = (Object.keys(PRICE_TARGET_LABELS) as PriceTargetType[]).map((value) => ({
  value,
  label: PRICE_TARGET_LABELS[value],
}));

const UNIT_OPTIONS = Object.entries(PRICE_UNIT_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/**
 * Product prices, option adjustments, tier prices, delivery and rush fees all
 * live in one table — the target type decides which extra fields matter.
 */
export function PriceItemsPanel({
  priceListId,
  currency,
  items,
  loading,
  onCreate,
  onUpdate,
  onDelete,
  targetFilter,
  title,
  description,
}: {
  priceListId: string;
  currency: string;
  items: PriceListItem[];
  loading?: boolean;
  onCreate: (values: PriceListItemInput) => void;
  onUpdate: (id: string, values: Partial<PriceListItemInput>) => void;
  onDelete: (id: string) => void;
  targetFilter?: PriceTargetType[];
  title: string;
  description: string;
}) {
  const products = useProducts();
  const options = useAllOptions();
  const optionGroups = useOptionGroups();

  /** Sizes come from the catalog's "size" option group — never typed by hand. */
  const sizeChoices = useMemo(() => {
    const sizeGroupId = optionGroups.data?.find((g) => g.key === "size")?.id;
    if (!sizeGroupId) return [];
    return (options.data ?? []).filter((o) => o.group_id === sizeGroupId);
  }, [optionGroups.data, options.data]);

  const rows = useMemo(
    () => (targetFilter ? items.filter((item) => targetFilter.includes(item.targetType)) : items),
    [items, targetFilter],
  );

  const productName = (id: string | null) =>
    products.data?.find((product) => product.id === id)?.name ?? null;
  const optionName = (id: string | null) =>
    options.data?.find((option) => option.id === id)?.name ?? null;
  const sizeName = (key: string) => sizeChoices.find((size) => size.key === key)?.name ?? key;

  return (
    <AdminSection title={title} description={description}>
      <CatalogCrudList<PriceListItem & { id: string }>
        rows={rows}
        loading={loading}
        addLabel="Add price"
        emptyMessage="No prices captured yet."
        onDelete={(row) => onDelete(row.id)}
        renderRow={(row) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {row.label}
              {!row.isActive && (
                <span className="ml-2 text-[11px] text-muted-foreground">Inactive</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {PRICE_TARGET_LABELS[row.targetType]} · {PRICE_UNIT_LABELS[row.unit]} ·{" "}
              {formatCents(row.amountCents, currency)}
              {row.productId ? ` · ${productName(row.productId) ?? "product"}` : ""}
              {row.optionId ? ` · ${optionName(row.optionId) ?? "option"}` : ""}
              {row.tierCount ? ` · ${row.tierCount} tiers` : ""}
              {row.sizeKey ? ` · ${sizeName(row.sizeKey)}` : ""}
            </p>
          </div>
        )}
        renderForm={(row, close) => (
          <PriceItemForm
            row={row}
            priceListId={priceListId}
            defaultTarget={targetFilter?.[0]}
            productOptions={[
              { value: "", label: "— none —" },
              ...(products.data ?? []).map((p) => ({ value: p.id, label: p.name })),
            ]}
            optionOptions={[
              { value: "", label: "— none —" },
              ...(options.data ?? []).map((o) => ({ value: o.id, label: o.name })),
            ]}
            sizeOptions={[
              { value: "", label: "All sizes" },
              ...sizeChoices.map((o) => ({ value: o.key, label: o.name })),
            ]}
            onCancel={close}
            onSubmit={(values) => {
              if (row) onUpdate(row.id, values);
              else onCreate(values);
              close();
            }}
          />
        )}
      />
    </AdminSection>
  );
}

function PriceItemForm({
  row,
  priceListId,
  defaultTarget,
  productOptions,
  optionOptions,
  sizeOptions,
  onSubmit,
  onCancel,
}: {
  row: PriceListItem | null;
  priceListId: string;
  defaultTarget?: PriceTargetType;
  productOptions: { value: string; label: string }[];
  optionOptions: { value: string; label: string }[];
  sizeOptions: { value: string; label: string }[];
  onSubmit: (values: PriceListItemInput) => void;
  onCancel: () => void;
}) {
  const { state, set } = useFormState({
    targetType: (row?.targetType ?? defaultTarget ?? "product") as PriceTargetType,
    label: row?.label ?? "",
    amount: centsToAmount(row?.amountCents ?? 0),
    unit: row?.unit ?? "flat",
    productId: row?.productId ?? "",
    optionId: row?.optionId ?? "",
    sizeKey: row?.sizeKey ?? "",
    tierCount: row?.tierCount ? String(row.tierCount) : "",
    minQuantity: String(row?.minQuantity ?? 1),
    notes: row?.notes ?? "",
    isActive: row?.isActive ?? true,
  });

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          priceListId,
          targetType: state.targetType,
          label: state.label,
          amountCents: parseAmountToCents(state.amount),
          unit: state.unit,
          productId: state.productId || null,
          optionId: state.optionId || null,
          sizeKey: state.sizeKey || null,
          tierCount: state.tierCount ? Number(state.tierCount) : null,
          minQuantity: Number(state.minQuantity) || 1,
          notes: state.notes || null,
          isActive: state.isActive,
        });
      }}
    >
      <NativeSelectField
        label="Applies to"
        value={state.targetType}
        onChange={(v) => set("targetType", v as PriceTargetType)}
        options={TARGET_OPTIONS}
      />
      <TextField label="Label" value={state.label} onChange={(v) => set("label", v)} />
      <TextField
        label="Amount"
        type="number"
        value={state.amount}
        onChange={(v) => set("amount", v)}
      />
      <NativeSelectField
        label="Unit"
        value={state.unit}
        onChange={(v) => set("unit", v as PriceListItem["unit"])}
        options={UNIT_OPTIONS}
      />
      {state.targetType === "product" && (
        <>
          <NativeSelectField
            label="Product"
            value={state.productId}
            onChange={(v) => set("productId", v)}
            options={productOptions}
          />
          <NativeSelectField
            label="Size (optional)"
            value={state.sizeKey}
            onChange={(v) => set("sizeKey", v)}
            options={sizeOptions}
          />
        </>
      )}
      {state.targetType === "option" && (
        <NativeSelectField
          label="Option"
          value={state.optionId}
          onChange={(v) => set("optionId", v)}
          options={optionOptions}
        />
      )}
      {state.targetType === "tier" && (
        <TextField
          label="Number of tiers"
          type="number"
          value={state.tierCount}
          onChange={(v) => set("tierCount", v)}
        />
      )}
      <TextField
        label="Minimum quantity"
        type="number"
        value={state.minQuantity}
        onChange={(v) => set("minQuantity", v)}
      />
      <TextField label="Notes" value={state.notes} onChange={(v) => set("notes", v)} />
      <ToggleField label="Active" checked={state.isActive} onChange={(v) => set("isActive", v)} />
      <div className="sm:col-span-2">
        <FormActions onCancel={onCancel} />
      </div>
    </form>
  );
}
