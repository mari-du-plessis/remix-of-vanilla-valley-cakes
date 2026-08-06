import { useState } from "react";
import { AdminSection } from "@/features/admin/components/AdminSection";
import { Switch } from "@/components/ui/switch";
import {
  useCategories,
  useDeleteProduct,
  useOptionGroups,
  useProductOptionGroups,
  useProducts,
  useSaveProduct,
  useSetProductOptionGroup,
} from "@/features/catalog/hooks/useCatalog";
import { uniqueSlug } from "@/features/catalog/lib/slug";
import { PRODUCT_KINDS, type Product, type ProductKind } from "@/features/catalog/types";
import { CatalogCrudList } from "./CatalogCrudList";
import {
  AreaField,
  FormActions,
  NativeSelectField,
  TextField,
  ToggleField,
  useFormState,
} from "./fields";

function ProductForm({ row, onClose }: { row: Product | null; onClose: () => void }) {
  const save = useSaveProduct();
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const { state, set } = useFormState({
    name: row?.name ?? "",
    description: row?.description ?? "",
    category_id: row?.category_id ?? "",
    kind: (row?.kind ?? "cake") as ProductKind,
    sort_order: String(row?.sort_order ?? 0),
    is_active: row?.is_active ?? true,
  });

  const nameError = state.name.trim() ? null : "Name is required";
  const slug = state.name.trim()
    ? uniqueSlug(
        state.name,
        products.map((p) => p.slug),
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
          category_id: state.category_id || null,
          kind: state.kind,
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

      <NativeSelectField
        label="Category"
        value={state.category_id}
        onChange={(v) => set("category_id", v)}
        options={[
          { value: "", label: "No category" },
          ...categories.map((c) => ({ value: c.id, label: c.name })),
        ]}
      />
      <NativeSelectField
        label="Kind"
        value={state.kind}
        onChange={(v) => set("kind", v as ProductKind)}
        options={PRODUCT_KINDS}
      />
      <div className="sm:col-span-2">
        <AreaField
          label="Description"
          value={state.description}
          onChange={(v) => set("description", v)}
        />
      </div>
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
        <FormActions
          onCancel={onClose}
          saving={save.isPending || Boolean(nameError)}
        />
      </div>
    </form>
  );
}

/** Which option groups a product offers — the seam the cake builder reads. */
function ProductOptionGroups({ product }: { product: Product }) {
  const { data: groups = [] } = useOptionGroups();
  const { data: links = [], isPending } = useProductOptionGroups(product.id);
  const setLink = useSetProductOptionGroup();
  const linked = new Set(links.map((l) => l.option_group_id));

  return (
    <div className="mt-4 rounded-xl border border-border/70 bg-background/60 p-4">
      <p className="text-sm font-medium">Option groups for {product.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Choose which sets of options customers can pick for this product.
      </p>
      {isPending ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {groups.map((group) => (
            <label key={group.id} className="flex items-center gap-3 text-sm">
              <Switch
                checked={linked.has(group.id)}
                onCheckedChange={(enabled) =>
                  setLink.mutate({
                    product_id: product.id,
                    option_group_id: group.id,
                    enabled,
                    sort_order: group.sort_order,
                  })
                }
              />
              {group.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductsPanel() {
  const { data = [], isPending } = useProducts();
  const { data: categories = [] } = useCategories();
  const remove = useDeleteProduct();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.find((p) => p.id === selectedId) ?? null;
  const categoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorised";

  return (
    <AdminSection
      title="Products"
      description="Everything the bakery sells — cakes, baked goods, gift cards, delivery and services."
    >
      <CatalogCrudList
        rows={data}
        loading={isPending}
        addLabel="Add product"
        emptyMessage="No products yet."
        selectedId={selectedId}
        onSelect={(row) => setSelectedId(row.id === selectedId ? null : row.id)}
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
              {categoryName(row.category_id)} · {row.kind.replace("_", " ")}
            </p>
          </>
        )}
        renderForm={(row, close) => <ProductForm row={row} onClose={close} />}
      />
      {selected && <ProductOptionGroups product={selected} />}
    </AdminSection>
  );
}
