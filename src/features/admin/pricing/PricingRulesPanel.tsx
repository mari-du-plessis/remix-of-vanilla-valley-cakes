import { clampRangeEnd } from "@/lib/date-range";
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

const RULE_OPTIONS = (Object.keys(PRICING_RULE_LABELS) as PricingRuleType[]).map((value) => ({
  value,
  label: PRICING_RULE_LABELS[value],
}));

const ADJUSTMENT_OPTIONS = [
  { value: "fixed", label: "Fixed amount" },
  { value: "percentage", label: "Percentage of subtotal" },
];

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

/** Plain-English explanation shown above the guided condition fields. */
const RULE_HELP: Record<PricingRuleType, string> = {
  rush_order: "Adds a fee when the event date is close to the order date.",
  delivery_zone: "Adds a fee when the delivery zone matches the one below.",
  weekend_surcharge: "Adds a fee to every Saturday and Sunday event.",
  holiday_surcharge: "Adds a fee to public holiday events.",
  seasonal_promotion:
    "Applies a discount or increase between the effective dates below. Use a negative amount for a discount.",
  minimum_order: "Raises the quotation to this minimum order value.",
  custom: "An advanced rule your future rule engine reads from the JSON below.",
};

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
  const existing = (row?.conditions ?? {}) as Record<string, unknown>;
  const { state, set } = useFormState({
    ruleType: (row?.ruleType ?? "rush_order") as PricingRuleType,
    name: row?.name ?? "",
    description: row?.description ?? "",
    adjustmentType: row?.adjustmentType ?? "fixed",
    value:
      row?.adjustmentType === "percentage"
        ? String(row.adjustmentValue)
        : centsToAmount(row?.adjustmentValue ?? 0),
    rushDays: String(existing["maxLeadTimeDays"] ?? 3),
    zoneKey: typeof existing["zoneKey"] === "string" ? (existing["zoneKey"] as string) : "",
    customJson: JSON.stringify(existing, null, 0),
    priority: String(row?.priority ?? 0),
    effectiveFrom: row?.effectiveFrom ?? "",
    effectiveTo: row?.effectiveTo ?? "",
    isActive: row?.isActive ?? true,
    global: row ? row.priceListId === null : false,
  });

  let customError: string | null = null;
  if (state.ruleType === "custom") {
    try {
      JSON.parse(state.customJson || "{}");
    } catch {
      customError = "Conditions must be valid JSON";
    }
  }

  const nameError = state.name.trim() ? null : "Name is required";
  const zoneError =
    state.ruleType === "delivery_zone" && !state.zoneKey.trim()
      ? "Add the delivery zone this fee applies to"
      : null;
  const hasError = Boolean(customError || nameError || zoneError);

  const buildConditions = (): Record<string, unknown> => {
    switch (state.ruleType) {
      case "rush_order":
        return { maxLeadTimeDays: Number(state.rushDays) || 0 };
      case "delivery_zone":
        return { zoneKey: state.zoneKey.trim() };
      case "custom":
        return JSON.parse(state.customJson || "{}");
      default:
        return {};
    }
  };

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
          conditions: buildConditions(),
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
      <div>
        <TextField label="Name" value={state.name} onChange={(v) => set("name", v)} />
        {nameError && <p className="mt-1 text-xs text-destructive">{nameError}</p>}
      </div>

      <p className="sm:col-span-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        {RULE_HELP[state.ruleType]}
      </p>

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

      {state.ruleType === "rush_order" && (
        <TextField
          label="Apply when the event is within (days)"
          type="number"
          value={state.rushDays}
          onChange={(v) => set("rushDays", v)}
        />
      )}
      {state.ruleType === "delivery_zone" && (
        <div>
          <TextField
            label="Delivery zone"
            value={state.zoneKey}
            placeholder="cape-town-central"
            onChange={(v) => set("zoneKey", v)}
          />
          {zoneError && <p className="mt-1 text-xs text-destructive">{zoneError}</p>}
        </div>
      )}

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
        min={state.effectiveFrom || undefined}
        onChange={(v) => set("effectiveTo", clampRangeEnd(state.effectiveFrom, v))}
      />
      <ToggleField
        label="Applies to every price list"
        checked={state.global}
        onChange={(v) => set("global", v)}
      />

      {state.ruleType === "custom" && (
        <div className="sm:col-span-2">
          <AreaField
            label="Conditions (JSON)"
            value={state.customJson}
            onChange={(v) => set("customJson", v)}
          />
          {customError && <p className="mt-1 text-xs text-destructive">{customError}</p>}
        </div>
      )}

      <div className="sm:col-span-2">
        <AreaField
          label="Description"
          value={state.description}
          onChange={(v) => set("description", v)}
        />
      </div>
      <ToggleField label="Active" checked={state.isActive} onChange={(v) => set("isActive", v)} />
      <div className="sm:col-span-2">
        <FormActions onCancel={onCancel} saving={hasError} />
      </div>
    </form>
  );
}
