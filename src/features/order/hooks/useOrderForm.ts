import { useCallback, useEffect, useState } from "react";
import { flavourPairing, tierCount, type CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import { clampTierCount } from "@/features/cake-builder/lib/geometry";

import { FEATURE_FLAGS } from "@/config/features";
import {
  clearGalleryInspiration,
  readGalleryInspiration,
} from "@/features/gallery/lib/inspiration-reference";
import { useAvailabilityWindow } from "@/features/calendar/hooks/useAvailability";
import {
  EMPTY_ORDER_FORM,
  ORDER_STEPS,
  type CakeTier,
  type OrderFormState,
} from "../types";

/**
 * Owns all order wizard state, tier rules and per-step validation.
 * Cake choices come from the catalog (database-backed) rather than constants,
 * so tiers and signature pairings follow whatever the bakery configures.
 */
export function useOrderForm(catalog: CakeCatalog) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OrderFormState>(EMPTY_ORDER_FORM);

  /**
   * Availability runs behind the scenes today: the lookup always happens so the
   * data is ready, but dates are only refused once
   * `FEATURE_FLAGS.enforceOrderAvailability` is switched on. The customer UI is
   * unchanged until then.
   */
  const availability = useAvailabilityWindow();

  /**
   * A gallery photo chosen via "Use as inspiration" is parked in session
   * storage by the gallery; the wizard adopts it once on mount. Reading it
   * here keeps the hand-off inside the existing form state rather than adding
   * a new global store.
   */
  useEffect(() => {
    const reference = readGalleryInspiration();
    if (reference) setForm((f) => ({ ...f, galleryInspiration: reference }));
  }, []);

  const clearGalleryReference = useCallback(() => {
    clearGalleryInspiration();
    setForm((f) => ({ ...f, galleryInspiration: null }));
  }, []);

  /**
   * Replaces the whole design in one go — used when a Saved Design is opened
   * so the wizard resumes exactly as it was left.
   */
  const loadForm = useCallback((next: OrderFormState) => setForm(next), []);

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

  const setSize = useCallback(
    (sizeId: string) => {
      const count = tierCount(catalog, sizeId);
      setForm((f) => ({
        ...f,
        size: sizeId,
        tiers:
          count > 0
            ? Array.from({ length: count }, (_, i) => f.tiers[i] ?? { flavour: "", filling: "" })
            : [],
      }));
    },
    [catalog],
  );

  /**
   * Tier count chosen in the guided builder. One tier is stored as an empty
   * tier list, matching the single-flavour path the order summary already uses.
   */
  const setTierCount = useCallback((requested: number) => {
    /** The bakery's maximum is enforced here as well as in the renderer. */
    const count = clampTierCount(requested);
    setForm((f) => ({
      ...f,
      tiers:
        count > 1
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

  const setTierFlavour = useCallback(
    (index: number, name: string) => {
      const pairing = flavourPairing(catalog, name);
      setForm((f) => ({
        ...f,
        tiers: f.tiers.map((t, i) =>
          i === index ? { flavour: name, filling: pairing ?? "" } : t,
        ),
      }));
    },
    [catalog],
  );

  const setFlavour = useCallback(
    (name: string) => {
      const pairing = flavourPairing(catalog, name);
      setForm((f) => ({ ...f, flavour: name, filling: pairing ?? "" }));
    },
    [catalog],
  );

  const canContinue = useCallback(() => {
    if (step === 0) return !!form.occasion;
    if (step === 1) {
      if (!form.size) return false;
      const count = tierCount(catalog, form.size);
      if (count > 0) {
        return form.tiers.length === count && form.tiers.every((t) => t.flavour && t.filling);
      }
      return !!form.flavour && !!form.filling;
    }
    if (step === 2) {
      if (!form.eventDate) return false;
      if (FEATURE_FLAGS.enforceOrderAvailability)
        return availability.isDateAvailable(form.eventDate);
      return true;
    }
    return !!form.name && !!form.phone;
  }, [step, form, catalog, availability]);

  return {
    step,
    setStep,
    isLastStep: step === ORDER_STEPS.length - 1,
    form,
    loadForm,
    update,
    toggleExtra,
    setInspirationFile,
    clearGalleryReference,
    setSize,
    setTierCount,

    setTierField,
    setTierFlavour,
    setFlavour,
    canContinue,
    /** Availability integration point for the customer wizard (see feature flag). */
    availability,
  };
}
