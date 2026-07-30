import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SelectableCardProps = {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
};

/**
 * Large tappable option card used across the order flow
 * (occasion picker, size picker).
 */
export function SelectableCard({
  selected,
  onSelect,
  children,
  className,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "rounded-2xl border text-left transition-all",
        selected
          ? "border-primary bg-accent text-accent-foreground"
          : "border-border bg-background hover:border-primary/40",
        className,
      )}
    >
      {children}
    </button>
  );
}
