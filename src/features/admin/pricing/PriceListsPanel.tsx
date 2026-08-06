import { AdminSection } from "@/features/admin/components/AdminSection";
import { CatalogCrudList } from "@/features/admin/catalog/CatalogCrudList";
import {
  FormActions,
  NativeSelectField,
  TextField,
  ToggleField,
  useFormState,
} from "@/features/admin/catalog/fields";
import { uniqueSlug } from "@/features/catalog/lib/slug";
import type { PriceList } from "@/features/pricing/types";
import type { PriceListInput } from "@/features/pricing/api/schema";

const CURRENCIES = [{ value: "ZAR", label: "ZAR (R)" }];


/** Manage the named price lists (standard, festive season, wholesale…). */
export function PriceListsPanel({
  priceLists,
  loading,
  selectedId,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  totalItems,
}: {
  priceLists: PriceList[];
  loading?: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (values: PriceListInput) => void;
  onUpdate: (id: string, values: Partial<PriceListInput>) => void;
  onDelete: (id: string) => void;
  totalItems?: number;
}) {
  return (
    <AdminSection
      title="Price lists"
      description="Each list is a complete set of prices with its own effective dates. The default list is used for new quotations."
    >
      <CatalogCrudList<PriceList & { id: string }>
        rows={priceLists}
        loading={loading}
        addLabel="New price list"
        emptyMessage="No price lists yet."
        selectedId={selectedId}
        onSelect={(row) => onSelect(row.id)}
        onDelete={(row) => onDelete(row.id)}
        renderRow={(row) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {row.name}
              {row.isDefault && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  Default
                </span>
              )}
              {!row.isActive && (
                <span className="ml-2 text-[11px] text-muted-foreground">Inactive</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.currency}
              {row.effectiveFrom ? ` · from ${row.effectiveFrom}` : ""}
              {row.effectiveTo ? ` · until ${row.effectiveTo}` : ""}
              {selectedId === row.id && totalItems !== undefined
                ? ` · ${totalItems} prices`
                : ""}
            </p>
          </div>
        )}
        renderForm={(row, close) => (
          <PriceListForm
            row={row}
            takenSlugs={priceLists.map((list) => list.slug)}
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

function PriceListForm({
  row,
  takenSlugs,
  onSubmit,
  onCancel,
}: {
  row: PriceList | null;
  takenSlugs: string[];
  onSubmit: (values: PriceListInput) => void;
  onCancel: () => void;
}) {
  const { state, set } = useFormState({
    name: row?.name ?? "",
    currency: row?.currency ?? "ZAR",
    effectiveFrom: row?.effectiveFrom ?? "",
    effectiveTo: row?.effectiveTo ?? "",
    isDefault: row?.isDefault ?? false,
    isActive: row?.isActive ?? true,
  });

  const nameError = state.name.trim() ? null : "Name is required";
  const slug = state.name.trim()
    ? uniqueSlug(state.name, takenSlugs, row?.slug ?? null)
    : "";

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (nameError) return;
        onSubmit({
          name: state.name,
          slug,
          currency: state.currency,
          effectiveFrom: state.effectiveFrom || null,
          effectiveTo: state.effectiveTo || null,
          isDefault: state.isDefault,
          isActive: state.isActive,
        });
      }}
    >
      <div>
        <TextField label="Name" value={state.name} onChange={(v) => set("name", v)} />
        <p className="mt-1 text-xs text-muted-foreground">
          {nameError ? (
            <span className="text-destructive">{nameError}</span>
          ) : (
            <>Reference: {slug}</>
          )}
        </p>
      </div>

      <NativeSelectField
        label="Currency"
        value={state.currency}
        onChange={(v) => set("currency", v)}
        options={CURRENCIES}
      />
      <TextField
        label="Effective from"
        type="date"
        value={state.effectiveFrom}
        onChange={(v) => set("effectiveFrom", v)}
      />
      <TextField
        label="Effective to"
        type="date"
        value={state.effectiveTo}
        onChange={(v) => set("effectiveTo", v)}
      />
      <ToggleField
        label="Default list"
        checked={state.isDefault}
        onChange={(v) => set("isDefault", v)}
      />
      <ToggleField
        label="Active"
        checked={state.isActive}
        onChange={(v) => set("isActive", v)}
      />
      <div className="sm:col-span-2">
        <FormActions onCancel={onCancel} />
      </div>
    </form>
  );
}
