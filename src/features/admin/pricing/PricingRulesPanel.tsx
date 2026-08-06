import { AdminSection } from "@/features/admin/components/AdminSection";
import { CatalogCrudList } from "@/features/admin/catalog/CatalogCrudList";
import {
  AreaField,
  FormActions,
  NativeSelectField,
  TextField,
  ToggleField,
  useFormState,
} from "@/features/admin/catalog/fields";
import { centsToAmount, formatCents, parseAmountToCents } from "@/features/pricing/lib/money";
import {
  PRICING_RULE_LABELS,
  type PricingRule,
  type PricingRuleType,
} from "@/features/pricing/types";
import type { PricingRuleInput } from "@/features/pricing/api/schema";

const RULE_OPTIONS = (Object.keys(PRICING_RULE_LABELS) as PricingRuleType[]).map(
  (value) => ({ value, label: PRICING_RULE_LABELS[value] }),
);

const ADJUSTMENT_OPTIONS = [
  { value: "fixed", label: "Fixed amount" },
  { value: "percentage", label: "Percentage of subtotal" },
];

/** Condition hints shown under the condition editor per rule type. */
const CONDITION_HINTS: Record<PricingRuleType, string> = {
  rush_order: '{"maxLeadTimeDays": 3}',
  delivery_zone: '{"zoneKey": "cape-town-central"}',
  weekend_surcharge: "No conditions needed — applies to Saturday and Sunday events.",
  holiday_surcharge: "No conditions needed — applies to supplied public holidays.",
  seasonal_promotion: "Use the effective dates to bound the promotion.",
  minimum_order: "The amount below becomes the minimum order value.",
  custom: '{"anything": "your future rule engine reads"}',
};

/** Rush fees, delivery zones, surcharges, promotions and minimum order values. */
export function PricingRulesPanel({
  priceListId,
  currency,
  rules,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: {
  priceListId: string;
  currency: string;
  rules: PricingRule[];
  loading?: boolean;
  onCreate: (values: PricingRuleInput) => void;
  onUpdate: (id: string, values: Partial<PricingRuleInput>) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <AdminSection
      title="Pricing rules"
      description="Conditional adjustments applied on top of the priced lines — rush orders, delivery zones, weekend and holiday surcharges, seasonal promotions and minimum order values."
    >
      <CatalogCrudList<PricingRule & { id: string }>
        rows={rules}
        loading={loading}
        addLabel="New rule"
        emptyMessage="No pricing rules yet."
        onDelete={(row) => onDelete(row.id)}
        renderRow={(row) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {row.name}
              {!row.isActive && (
                <span className="ml-2 text-[11px] text-muted-foreground">Inactive</span>
              )}
              {row.priceListId === null && (
                <span className="ml-2 text-[11px] text-muted-foreground">Global</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {PRICING_RULE_LABELS[row.ruleType]} ·{" "}
              {row.adjustmentType === "percentage"
                ? `${row.adjustmentValue}%`
                : formatCents(row.adjustmentValue, currency)}
              {row.priority ? ` · priority ${row.priority}` : ""}
              {row.effectiveFrom ? ` · from ${row.effectiveFrom}` : ""}
              {row.effectiveTo ? ` · until ${row.effectiveTo}` : ""}
            </p>
          </div>
        )}
        renderForm={(row, close) => (
          <PricingRuleForm
            row={row}
            priceListId={priceListId}
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

function PricingRuleForm({
  row,
  priceListId,
  onSubmit,
  onCancel,
}: {
  row: PricingRule | null;
  priceListId: string;
  onSubmit: (values: PricingRuleInput) => void;
  onCancel: () => void;
}) {
  const { state, set } = useFormState({
    ruleType: (row?.ruleType ?? "rush_order") as PricingRuleType,
    name: row?.name ?? "",
    description: row?.description ?? "",
    adjustmentType: row?.adjustmentType ?? "fixed",
    value:
      row?.adjustmentType === "percentage"
        ? String(row.adjustmentValue)
        : centsToAmount(row?.adjustmentValue ?? 0),
    conditions: JSON.stringify(row?.conditions ?? {}, null, 0),
    priority: String(row?.priority ?? 0),
    effectiveFrom: row?.effectiveFrom ?? "",
    effectiveTo: row?.effectiveTo ?? "",
    isActive: row?.isActive ?? true,
    global: row ? row.priceListId === null : false,
  });

  let conditionsError: string | null = null;
  try {
    JSON.parse(state.conditions || "{}");
  } catch {
    conditionsError = "Conditions must be valid JSON";
  }

  const nameError = state.name.trim() ? null : "Name is required";
  const hasError = Boolean(conditionsError || nameError);

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (hasError) return;
        onSubmit({
          priceListId: state.global ? null : priceListId,
          ruleType: state.ruleType,
          name: state.name.trim(),
          description: state.description || null,
          adjustmentType: state.adjustmentType,
          adjustmentValue:
            state.adjustmentType === "percentage"
              ? Math.round(Number(state.value) || 0)
              : parseAmountToCents(state.value),
          conditions: JSON.parse(state.conditions || "{}"),
          priority: Number(state.priority) || 0,
          effectiveFrom: state.effectiveFrom || null,
          effectiveTo: state.effectiveTo || null,
          isActive: state.isActive,
        });
      }}
    >
      <NativeSelectField
        label="Rule type"
        value={state.ruleType}
        onChange={(v) => set("ruleType", v as PricingRuleType)}
        options={RULE_OPTIONS}
      />
      <TextField label="Name" value={state.name} onChange={(v) => set("name", v)} />
      <NativeSelectField
        label="Adjustment"
        value={state.adjustmentType}
        onChange={(v) => set("adjustmentType", v as PricingRule["adjustmentType"])}
        options={ADJUSTMENT_OPTIONS}
      />
      <TextField
        label={state.adjustmentType === "percentage" ? "Percent" : "Amount"}
        type="number"
        value={state.value}
        onChange={(v) => set("value", v)}
      />
      <TextField
        label="Priority"
        type="number"
        value={state.priority}
        onChange={(v) => set("priority", v)}
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
        label="Applies to every price list"
        checked={state.global}
        onChange={(v) => set("global", v)}
      />
      <div className="sm:col-span-2">
        <AreaField
          label="Conditions (JSON)"
          value={state.conditions}
          onChange={(v) => set("conditions", v)}
        />
        <p
          className={`mt-1 text-xs ${conditionsError ? "text-destructive" : "text-muted-foreground"}`}
        >
          {conditionsError ?? CONDITION_HINTS[state.ruleType]}
        </p>
      </div>
      <div className="sm:col-span-2">
        <AreaField
          label="Description"
          value={state.description}
          onChange={(v) => set("description", v)}
        />
      </div>
      <ToggleField
        label="Active"
        checked={state.isActive}
        onChange={(v) => set("isActive", v)}
      />
      <div className="sm:col-span-2">
        <FormActions onCancel={onCancel} saving={Boolean(conditionsError)} />
      </div>
    </form>
  );
}
