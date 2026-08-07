import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { generateCakeAssetSvg } from "../api/assets.functions";
import { saveCakeAsset } from "../api";
import { cakeBuilderKeys, type CakeAssetCategory, type CakeAssetSlot } from "../types";

/**
 * Placement rules for an appearance token, so a generated asset lands on the
 * right rendering layer without anyone choosing a slot by hand. Adding a new
 * token family only means adding a rule here.
 */
export function placementFor(token: string): {
  category: CakeAssetCategory;
  slot: CakeAssetSlot;
  zIndex: number;
} | null {
  if (token.startsWith("shape-")) return { category: "shape", slot: "tier-body", zIndex: 10 };
  if (token.startsWith("icing-")) return { category: "icing", slot: "tier-finish", zIndex: 20 };
  if (token === "decor-drip") return { category: "drip", slot: "drip", zIndex: 30 };
  if (token === "decor-sprinkles") return { category: "sprinkle", slot: "scatter", zIndex: 40 };
  if (token === "decor-gold-leaf") return { category: "gold_leaf", slot: "scatter", zIndex: 45 };
  if (token === "decor-pearls") return { category: "pearl", slot: "border", zIndex: 35 };
  if (token === "decor-topper" || token === "decor-candles")
    return { category: "topper", slot: "topper", zIndex: 70 };
  if (token.startsWith("decor-")) return { category: "decoration", slot: "cluster", zIndex: 50 };
  // sponge-* / filling-* / size-* tokens are colour or geometry only: no artwork.
  return null;
}

/**
 * Generates missing artwork with AI and stores it in the asset library.
 * Existing assets are never touched — the caller only offers tokens that have
 * no asset yet, and an admin can edit or replace the result afterwards.
 */
export function useGenerateCakeAsset() {
  const queryClient = useQueryClient();
  const generate = useServerFn(generateCakeAssetSvg);

  return useMutation({
    mutationFn: async ({ token, label }: { token: string; label: string }) => {
      const placement = placementFor(token);
      if (!placement) throw new Error("This appearance is a colour only — no artwork needed.");

      const { svg } = await generate({ data: { token, label, slot: placement.slot } });

      await saveCakeAsset({
        key: token,
        name: label,
        category: placement.category,
        slot: placement.slot,
        z_index: placement.zIndex,
        svg_content: svg,
        notes: "Generated with AI — review and refine.",
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cakeBuilderKeys.all });
      toast.success("Artwork generated and added to the library");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
