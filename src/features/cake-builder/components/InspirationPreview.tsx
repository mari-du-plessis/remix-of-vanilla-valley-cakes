import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Muted } from "@/components/common/Typography";

/**
 * InspirationPreview — the AI counterpart to the SVG illustration.
 *
 * The SVG preview is exact and instant; the AI concept is artistic and is
 * created automatically as part of sending the request, so the customer never
 * has to ask for it. This component only displays whatever concept the order
 * currently holds.
 */
export function InspirationPreview({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "surface-card overflow-hidden rounded-3xl border border-border/60 p-4",
        className,
      )}
    >
      <p className="eyebrow text-[0.6rem] text-primary">AI concept</p>

      {url ? (
        <figure className="mt-3">
          <img
            src={url}
            alt="AI generated artistic interpretation of your cake design"
            className="w-full rounded-2xl border border-border/50 object-cover"
            loading="lazy"
          />
        </figure>
      ) : (
        <Muted className="mt-2 flex items-center gap-2 text-[11px] leading-relaxed">
          <Sparkles className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
          We'll create an artistic concept of your design automatically when you send your request.
        </Muted>
      )}
    </div>
  );
}
