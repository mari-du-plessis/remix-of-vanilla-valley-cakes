import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Muted } from "@/components/common/Typography";

/**
 * InspirationPreview — the AI counterpart to the SVG illustration.
 *
 * The SVG preview is exact and instant; this one is artistic and generated on
 * request. Both are shown together so the customer sees the configuration they
 * chose and the mood it creates.
 */
export function InspirationPreview({
  url,
  stale,
  pending,
  onGenerate,
  className,
}: {
  url: string;
  stale: boolean;
  pending: boolean;
  onGenerate: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "surface-card overflow-hidden rounded-3xl border border-border/60 p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-[0.6rem] text-primary">Inspiration preview</p>
        {url && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full text-xs"
            onClick={onGenerate}
            disabled={pending}
          >
            <Sparkles className="mr-1 h-3 w-3" /> Regenerate
          </Button>
        )}
      </div>

      {url ? (
        <figure className="mt-3 space-y-2">
          <img
            src={url}
            alt="AI generated artistic interpretation of your cake design"
            className={cn(
              "w-full rounded-2xl border border-border/50 object-cover transition-opacity duration-500",
              pending && "opacity-40",
            )}
            loading="lazy"
          />
          {stale && (
            <p className="text-[11px] text-primary">
              The design has changed since this preview was generated.
            </p>
          )}
        </figure>
      ) : (
        <div className="mt-3 space-y-3 text-center">
          <Muted className="text-[11px] leading-relaxed">
            Generate an elegant artistic impression of the cake you've designed.
          </Muted>
          <Button
            onClick={onGenerate}
            disabled={pending}
            variant="outline"
            className="h-11 w-full rounded-full"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating your preview…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate inspiration preview
              </>
            )}
          </Button>
        </div>
      )}

      {url && pending && (
        <p className="mt-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Creating your preview…
        </p>
      )}
    </div>
  );
}
