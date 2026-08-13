import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOptions, fetchOptionGroups, fetchProducts } from "@/features/catalog/api";
import { catalogKeys } from "@/features/catalog/types";
import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import type { CakeTier, OrderFormState } from "@/features/order/types";
import { useCakeAssets } from "./useCakeBuilder";
import { buildBuilderSteps, type BuilderStep, type BuilderStepKind } from "../lib/steps";
import { clampTierCount } from "../lib/geometry";
import { setTreatment, type ColourTreatment } from "../lib/appearance";


const STALE = 5 * 60 * 1000;

/** Everything the guided builder needs to write back to the order form. */
export type BuilderActions = {
  update: <K extends keyof OrderFormState>(key: K, value: OrderFormState[K]) => void;
  setSize: (sizeId: string) => void;
  setTierCount: (count: number) => void;
  setFlavour: (name: string) => void;
  setTierFlavour: (index: number, name: string) => void;
  setTierField: (index: number, key: keyof CakeTier, value: string) => void;
  toggleExtra: (extra: string) => void;
};

/**
 * Guided cake builder state.
 *
 * The builder is a presentation layer: it owns nothing but the current step.
 * Every answer is written straight back into the existing order form, so
 * orders, quotes, pricing and the WhatsApp summary keep working unchanged.
 */
export function useGuidedBuilder(
  form: OrderFormState,
  catalog: CakeCatalog,
  actions: BuilderActions,
  /**
   * Steps to leave out. Used where the answer is already decided by the
   * surface itself — the admin template editor, for instance, only ever
   * designs custom cakes, so it hides the product question.
   */
  options: { skipKinds?: BuilderStepKind[] } = {},
) {
  const [stepIndex, setStepIndex] = useState(0);

  const { data: assets = [] } = useCakeAssets();
  const { data: products = [] } = useQuery({
    queryKey: catalogKeys.products,
    queryFn: fetchProducts,
    staleTime: STALE,
  });
  const { data: groups = [] } = useQuery({
    queryKey: catalogKeys.groups,
    queryFn: fetchOptionGroups,
    staleTime: STALE,
  });
  const { data: optionRows = [] } = useQuery({
    queryKey: [...catalogKeys.all, "all-options"],
    queryFn: fetchAllOptions,
    staleTime: STALE,
  });

  const skipKinds = options.skipKinds;
  const steps = useMemo(() => {
    const all = buildBuilderSteps(catalog, { products, groups, options: optionRows, assets });
    return skipKinds?.length ? all.filter((s) => !skipKinds.includes(s.kind)) : all;
  }, [catalog, products, groups, optionRows, assets, skipKinds]);

  const index = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const step = steps[index];
  const tierCount = clampTierCount(form.tiers.length || 1);

  /** Current answer(s) for a step — per tier where the step asks per tier. */
  const valueOf = useCallback(
    (s: BuilderStep, tier = 0): string[] => {
      switch (s.kind) {
        case "product":
          return form.product ? [form.product] : [];
        case "shape":
          return form.shapeKey ? [form.shapeKey] : [];
        case "size":
          return form.size ? [form.size] : [];
        case "tiers":
          return [String(tierCount)];
        case "flavour": {
          const value = form.tiers.length > 0 ? form.tiers[tier]?.flavour : form.flavour;
          return value ? [value] : [];
        }
        case "filling": {
          const value = form.tiers.length > 0 ? form.tiers[tier]?.filling : form.filling;
          return value ? [value] : [];
        }
        case "icing":
          return form.icingKey ? [form.icingKey] : [];
        case "decoration":
          return form.extras;
        case "appearance":
          return [form.appearance.treatment];
      }
    },
    [form, tierCount],
  );

  const select = useCallback(
    (s: BuilderStep, id: string, tier = 0) => {
      switch (s.kind) {
        case "product":
          return actions.update("product", id);
        case "shape":
          return actions.update("shapeKey", id);
        case "size":
          return actions.setSize(id);
        case "tiers":
          return actions.setTierCount(Number(id) || 1);
        case "flavour":
          return form.tiers.length > 0 ? actions.setTierFlavour(tier, id) : actions.setFlavour(id);
        case "filling":
          return form.tiers.length > 0
            ? actions.setTierField(tier, "filling", id)
            : actions.update("filling", id);
        case "icing":
          return actions.update("icingKey", id);
        case "decoration":
          return actions.toggleExtra(id);
        case "appearance":
          return actions.update(
            "appearance",
            setTreatment(form.appearance, id as ColourTreatment),
          );
      }
    },
    [actions, form.appearance, form.tiers.length],
  );

  const isAnswered = useCallback(
    (s: BuilderStep) => {
      if (s.optional) return true;
      if (s.perTier) {
        return Array.from({ length: tierCount }, (_, i) => valueOf(s, i)).every(
          (v) => v.length > 0,
        );
      }
      return valueOf(s).length > 0;
    },
    [tierCount, valueOf],
  );

  return {
    steps,
    step,
    stepIndex: index,
    setStepIndex,
    tierCount,
    valueOf,
    select,
    isAnswered,
    atStart: index === 0,
    atEnd: index >= steps.length - 1,
    canAdvance: !step || isAnswered(step),
    /** Every step answered — the design is complete enough to send. */
    isComplete: steps.every(isAnswered),
    next: () => setStepIndex((i) => Math.min(i + 1, steps.length - 1)),
    back: () => setStepIndex((i) => Math.max(0, i - 1)),
  };
}

export type GuidedBuilder = ReturnType<typeof useGuidedBuilder>;
