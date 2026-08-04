import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSection } from "@/features/admin/components/AdminSection";
import {
  useAllOptions,
  useCreateOptionRule,
  useDeleteOption,
  useDeleteOptionGroup,
  useDeleteOptionRule,
  useOptionGroups,
  useOptionRules,
  useSaveOption,
  useSaveOptionGroup,
} from "@/features/catalog/hooks/useCatalog";
import type { CatalogOption, OptionGroup } from "@/features/catalog/types";
import { CatalogCrudList } from "./CatalogCrudList";
import {
  FormActions,
  NativeSelectField,
  TextField,
  ToggleField,
  useFormState,
} from "./fields";

function GroupForm({ row, onClose }: { row: OptionGroup | null; onClose: () => void }) {
  const save = useSaveOptionGroup();
  const { state, set } = useFormState({
    name: row?.name ?? "",
    key: row?.key ?? "",
    select_type: row?.select_type ?? "single",
    is_required: row?.is_required ?? false,
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
          key: state.key,
          select_type: state.select_type as OptionGroup["select_type"],
          is_required: state.is_required,
          sort_order: Number(state.sort_order) || 0,
          is_active: state.is_active,
        });
        onClose();
      }}
    >
      <TextField label="Name" value={state.name} onChange={(v) => set("name", v)} />
      <TextField
        label="Key"
        value={state.key}
        placeholder="auto from name"
        onChange={(v) => set("key", v)}
      />
      <NativeSelectField
        label="Selection"
        value={state.select_type}
        onChange={(v) => set("select_type", v as OptionGroup["select_type"])}
        options={[
          { value: "single", label: "Pick one" },
          { value: "multi", label: "Pick many" },
        ]}
      />
      <TextField
        label="Sort order"
        type="number"
        value={state.sort_order}
        onChange={(v) => set("sort_order", v)}
      />
      <ToggleField
        label="Required"
        checked={state.is_required}
        onChange={(v) => set("is_required", v)}
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

function OptionForm({
  row,
  groupId,
  onClose,
}: {
  row: CatalogOption | null;
  groupId: string;
  onClose: () => void;
}) {
  const save = useSaveOption();
  const meta = (row?.metadata ?? {}) as Record<string, unknown>;
  const { state, set } = useFormState({
    name: row?.name ?? "",
    key: row?.key ?? "",
    description: row?.description ?? "",
    svg_token: row?.svg_token ?? "",
    serves: typeof meta["serves"] === "string" ? (meta["serves"] as string) : "",
    tiers: typeof meta["tiers"] === "number" ? String(meta["tiers"]) : "",
    sort_order: String(row?.sort_order ?? 0),
    is_active: row?.is_active ?? true,
  });

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const metadata: Record<string, unknown> = { ...meta };
        if (state.serves) metadata["serves"] = state.serves;
        else delete metadata["serves"];
        if (state.tiers) metadata["tiers"] = Number(state.tiers);
        else delete metadata["tiers"];

        await save.mutateAsync({
          ...(row ? { id: row.id } : {}),
          group_id: groupId,
          name: state.name,
          key: state.key,
          description: state.description,
          svg_token: state.svg_token,
          sort_order: Number(state.sort_order) || 0,
          is_active: state.is_active,
          metadata,
        });
        onClose();
      }}
    >
      <TextField label="Name" value={state.name} onChange={(v) => set("name", v)} />
      <TextField
        label="Key"
        value={state.key}
        placeholder="auto from name"
        onChange={(v) => set("key", v)}
      />
      <TextField
        label="Serves (sizes only)"
        value={state.serves}
        placeholder="Serves 10–15"
        onChange={(v) => set("serves", v)}
      />
      <TextField
        label="Tiers (sizes only)"
        type="number"
        value={state.tiers}
        placeholder="0"
        onChange={(v) => set("tiers", v)}
      />
      <TextField
        label="Builder token"
        value={state.svg_token}
        placeholder="used by the cake builder"
        onChange={(v) => set("svg_token", v)}
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

/** Signature pairings, e.g. Red Velvet → Cream Cheese. */
function PairingRules({ options }: { options: CatalogOption[] }) {
  const { data: allOptions = [] } = useAllOptions();
  const { data: rules = [] } = useOptionRules();
  const create = useCreateOptionRule();
  const remove = useDeleteOptionRule();
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");

  const nameOf = (id: string | null) =>
    allOptions.find((o) => o.id === id)?.name ?? "—";
  const groupIds = new Set(options.map((o) => o.id));
  const groupRules = rules.filter((r) => groupIds.has(r.option_id));

  return (
    <div className="mt-4 rounded-xl border border-border/70 bg-background/60 p-4">
      <p className="text-sm font-medium">Signature pairings</p>
      <p className="mt-1 text-xs text-muted-foreground">
        When a paired option is chosen, the wizard fills the partner
        automatically instead of asking the customer.
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="h-10 min-w-40 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Choose an option…</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <span className="pb-2 text-sm text-muted-foreground">pairs with</span>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="h-10 min-w-40 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Choose a partner…</option>
          {allOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          className="rounded-full"
          disabled={!source || !target || create.isPending}
          onClick={() => {
            create.mutate(
              { option_id: source, rule_type: "pairs_with", target_option_id: target },
              {
                onSuccess: () => {
                  setSource("");
                  setTarget("");
                },
              },
            );
          }}
        >
          Add pairing
        </Button>
      </div>

      {groupRules.length > 0 && (
        <ul className="mt-3 space-y-1">
          {groupRules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm"
            >
              <span>
                {nameOf(rule.option_id)} → {nameOf(rule.target_option_id)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Remove pairing"
                onClick={() => remove.mutate(rule.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OptionsPanel() {
  const { data: groups = [], isPending } = useOptionGroups();
  const { data: allOptions = [] } = useAllOptions();
  const removeGroup = useDeleteOptionGroup();
  const removeOption = useDeleteOption();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = groups.find((g) => g.id === selectedId) ?? null;
  const options = allOptions
    .filter((o) => o.group_id === selectedId)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <AdminSection
      title="Option groups & options"
      description="Sizes, flavours, fillings, decorations — the choices customers make. Select a group to manage its options and pairings."
    >
      <CatalogCrudList
        rows={groups}
        loading={isPending}
        addLabel="Add option group"
        emptyMessage="No option groups yet."
        selectedId={selectedId}
        onSelect={(row) => setSelectedId(row.id === selectedId ? null : row.id)}
        onDelete={(row) => removeGroup.mutate(row.id)}
        renderRow={(row) => (
          <>
            <p className="text-sm font-medium">
              {row.name}
              {!row.is_active && (
                <span className="ml-2 text-xs text-muted-foreground">(hidden)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.select_type === "multi" ? "Pick many" : "Pick one"}
              {row.is_required ? " · required" : ""} ·{" "}
              {allOptions.filter((o) => o.group_id === row.id).length} options
            </p>
          </>
        )}
        renderForm={(row, close) => <GroupForm row={row} onClose={close} />}
      />

      {selected && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-border/70 bg-background/60 p-4">
            <p className="mb-3 text-sm font-medium">{selected.name} options</p>
            <CatalogCrudList
              rows={options}
              addLabel="Add option"
              emptyMessage="No options in this group yet."
              onDelete={(row) => removeOption.mutate(row.id)}
              renderRow={(row) => (
                <>
                  <p className="text-sm font-medium">
                    {row.name}
                    {!row.is_active && (
                      <span className="ml-2 text-xs text-muted-foreground">(hidden)</span>
                    )}
                  </p>
                  {row.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {row.description}
                    </p>
                  )}
                </>
              )}
              renderForm={(row, close) => (
                <OptionForm row={row} groupId={selected.id} onClose={close} />
              )}
            />
          </div>
          <PairingRules options={options} />
        </div>
      )}
    </AdminSection>
  );
}
