import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only tag row, and an editable variant used by the customer editor. */
export function CustomerTagList({
  tags,
  className,
  onRemove,
}: {
  tags: string[];
  className?: string;
  onRemove?: (tag: string) => void;
}) {
  if (tags.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
        >
          {tag}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(tag)}
              aria-label={`Remove tag ${tag}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
