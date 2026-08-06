import { useState } from "react";
import { AdminSection } from "@/features/admin/components/AdminSection";
import {
  useCategories,
  useDeleteCategory,
  useSaveCategory,
} from "@/features/catalog/hooks/useCatalog";
import { uniqueSlug } from "@/features/catalog/lib/slug";
import type { ProductCategory } from "@/features/catalog/types";
import { CatalogCrudList } from "./CatalogCrudList";
import { FormActions, TextField, ToggleField, useFormState } from "./fields";

function CategoryForm({
  row,
  onClose,
}: {
  row: ProductCategory | null;
  onClose: () => void;
}) {
  const save = useSaveCategory();
  const { data: categories = [] } = useCategories();
  const { state, set } = useFormState({
    name: row?.name ?? "",
    description: row?.description ?? "",
    sort_order: String(row?.sort_order ?? 0),
    is_active: row?.is_active ?? true,
  });

  const nameError = state.name.trim() ? null : "Name is required";
  const slug = state.name.trim()
    ? uniqueSlug(
        state.name,
        categories.map((c) => c.slug),
        row?.slug ?? null,
      )
    : "";

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (nameError) return;
        await save.mutateAsync({
          ...(row ? { id: row.id } : {}),
          name: state.name,
          slug,
          description: state.description,
          sort_order: Number(state.sort_order) || 0,
          is_active: state.is_active,
        });
        onClose();
      }}
    >
      <div>
        <TextField label="Name" value={state.name} onChange={(v) => set("name", v)} />
        <p className="mt-1 text-xs text-muted-foreground">
          {nameError ? (
            <span className="text-destructive">{nameError}</span>
          ) : (
            <>Web address: /{slug}</>
          )}
        </p>
      </div>
      <TextField
        label="Description"
        value={state.description}
        onChange={(v) => set("description", v)}
      />
      <TextField
        label="Sort order"
        type="number"
        value={state.sort_order}
        onChange={(v) => set("sort_order", v)}
      />
      <ToggleField
        label="Active"
        checked={state.is_active}
        onChange={(v) => set("is_active", v)}
      />
      <div className="sm:col-span-2">
        <FormActions onCancel={onClose} saving={save.isPending || Boolean(nameError)} />
      </div>
    </form>
  );
}

export function CategoriesPanel() {
  const { data = [], isPending } = useCategories();
  const remove = useDeleteCategory();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <AdminSection
      title="Categories"
      description="Groups products on the storefront — Custom Cakes, Cupcakes, Gift Cards and anything you add later."
    >
      <CatalogCrudList
        rows={data}
        loading={isPending}
        addLabel="Add category"
        emptyMessage="No categories yet."
        selectedId={selected}
        onSelect={(row) => setSelected(row.id)}
        onDelete={(row) => remove.mutate(row.id)}
        renderRow={(row) => (
          <>
            <p className="text-sm font-medium">
              {row.name}
              {!row.is_active && (
                <span className="ml-2 text-xs text-muted-foreground">(hidden)</span>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.description || row.slug}
            </p>
          </>
        )}
        renderForm={(row, close) => <CategoryForm row={row} onClose={close} />}
      />
    </AdminSection>
  );
}
