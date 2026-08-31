import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FALLBACK_SERVING_CHART,
  type ServingSize,
} from "@/features/cake-builder/lib/servings";

/**
 * The bakery's cutting chart, read from `serving_sizes` so admin can adjust
 * sizes and servings without a developer. The printed chart ships as a
 * fallback so the wizard can never render without sizes.
 */
export function useServingChart(): { chart: ServingSize[]; isPending: boolean } {
  const { data, isPending } = useQuery({
    queryKey: ["catalog", "serving-sizes"] as const,
    queryFn: async (): Promise<ServingSize[]> => {
      const { data, error } = await supabase
        .from("serving_sizes")
        .select("size_cm, servings, label, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []).map((row) => ({
        sizeCm: Number(row.size_cm),
        servings: row.servings,
        label: row.label ?? `${Number(row.size_cm)} cm`,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });

  const chart = useMemo(
    () => (data && data.length > 0 ? data : FALLBACK_SERVING_CHART),
    [data],
  );
  return { chart, isPending };
}
