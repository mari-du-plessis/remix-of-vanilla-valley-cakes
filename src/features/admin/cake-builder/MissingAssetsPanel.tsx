import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSection } from "@/features/admin/components/AdminSection";
import { APPEARANCE_TOKENS } from "@/config/cake-builder";
import {
  placementFor,
  useGenerateCakeAsset,
} from "@/features/cake-builder/hooks/useGenerateCakeAsset";
import type { CakeAsset } from "@/features/cake-builder/types";

/**
 * Missing artwork — the AI bootstrap for the asset library.
 *
 * Any appearance an option can be mapped to, but which has no SVG yet, is
 * listed here with a one-click generate action. Existing artwork is never
 * regenerated; the list simply empties as the library fills up.
 */
export function MissingAssetsPanel({ assets }: { assets: CakeAsset[] }) {
  const generate = useGenerateCakeAsset();

  const missing = useMemo(() => {
    const have = new Set(assets.map((a) => a.key));
    return APPEARANCE_TOKENS.filter((t) => !have.has(t.value) && placementFor(t.value));
  }, [assets]);

  if (missing.length === 0) return null;

  return (
    <AdminSection
      title="Missing artwork"
      description="These appearances can be selected on an option but have no SVG yet. Generate a placeholder now and refine it whenever you like."
    >
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {missing.map((token) => (
          <div
            key={token.value}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/60 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{token.label}</p>
              <p className="truncate text-xs text-muted-foreground">{token.value}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={generate.isPending}
              onClick={() =>
                generate.mutate({ token: token.value, label: token.label })
              }
            >
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              {generate.isPending ? "Working…" : "Generate"}
            </Button>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}
