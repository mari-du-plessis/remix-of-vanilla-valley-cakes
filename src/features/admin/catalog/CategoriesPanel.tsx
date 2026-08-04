import { useState } from "react";
import { AdminSection } from "@/features/admin/components/AdminSection";
import {
  useCategories,
  useDeleteCategory,
  useSaveCategory,
} from "@/features/catalog/hooks/useCatalog";
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
  const { state, set } = useFormState({
    name: row?.name ?? "",
    slug: row?.slug ?? "",
    description: row?.description ?? "",
    sort_order: String(row?.sort_order ?? 0),
    is_active: row?.is_active ?? true,
  });

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await save.mutateAsync({
          ...(row ? { id: row.id } : {}),
          name: state.name,
          slug: state.slug,
          description: state.description,
          sort_order: Number(state.sort_order) || 0,
          is_active: state.is_active,
        });
        onClose();
      }}
    >
      <TextField label="Name" value={state.name} onChange={(v) => set("name", v)} />
      <TextField
        label="Slug"
        value={state.slug}
        placeholder="auto from name"
        onChange={(v) => set("slug", v)}
      />
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
        <FormActions onCancel={onClose} saving={save.isPending} />
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
