import { useCallback, useState } from "react";
import { getPairing, getTierCount } from "@/config/catalog";
import {
  EMPTY_ORDER_FORM,
  ORDER_STEPS,
  type CakeTier,
  type OrderFormState,
} from "../types";

/**
 * Owns all order wizard state, tier rules and per-step validation.
 * The route component stays presentational.
 */
export function useOrderForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OrderFormState>(EMPTY_ORDER_FORM);

  const update = useCallback(
    <K extends keyof OrderFormState>(key: K, value: OrderFormState[K]) =>
      setForm((f) => ({ ...f, [key]: value })),
    [],
  );

  const toggleExtra = useCallback(
    (extra: string) =>
      setForm((f) => ({
        ...f,
        extras: f.extras.includes(extra)
          ? f.extras.filter((x) => x !== extra)
          : [...f.extras, extra],
      })),
    [],
  );

  const setInspirationFile = useCallback((file: File | null) => {
    setForm((f) => {
      if (f.inspirationPreview) URL.revokeObjectURL(f.inspirationPreview);
      return {
        ...f,
        inspirationFile: file,
        inspirationPreview: file ? URL.createObjectURL(file) : "",
      };
    });
  }, []);

  const setSize = useCallback((sizeId: string) => {
    const count = getTierCount(sizeId);
    setForm((f) => ({
      ...f,
      size: sizeId,
      tiers:
        count > 0
          ? Array.from({ length: count }, (_, i) => f.tiers[i] ?? { flavour: "", filling: "" })
          : [],
    }));
  }, []);

  const setTierField = useCallback((index: number, key: keyof CakeTier, value: string) => {
    setForm((f) => ({
      ...f,
      tiers: f.tiers.map((t, i) => (i === index ? { ...t, [key]: value } : t)),
    }));
  }, []);

  const setTierFlavour = useCallback((index: number, name: string) => {
    const pairing = getPairing(name);
    setForm((f) => ({
      ...f,
      tiers: f.tiers.map((t, i) =>
        i === index ? { flavour: name, filling: pairing ?? "" } : t,
      ),
    }));
  }, []);

  const setFlavour = useCallback((name: string) => {
    const pairing = getPairing(name);
    setForm((f) => ({ ...f, flavour: name, filling: pairing ?? "" }));
  }, []);

  const canContinue = useCallback(() => {
    if (step === 0) return !!form.occasion;
    if (step === 1) {
      if (!form.size) return false;
      const count = getTierCount(form.size);
      if (count > 0) {
        return form.tiers.length === count && form.tiers.every((t) => t.flavour && t.filling);
      }
      return !!form.flavour && !!form.filling;
    }
    if (step === 2) return !!form.eventDate;
    return !!form.name && !!form.phone;
  }, [step, form]);

  return {
    step,
    setStep,
    isLastStep: step === ORDER_STEPS.length - 1,
    form,
    update,
    toggleExtra,
    setInspirationFile,
    setSize,
    setTierField,
    setTierFlavour,
    setFlavour,
    canContinue,
  };
}
