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
        "rounded-2xl border text-left transition-all duration-300",
        selected
          ? "border-primary bg-primary/10 text-foreground shadow-[var(--shadow-soft)]"
          : "border-border bg-card/60 hover:border-primary/50 hover:bg-card",
        className,
      )}
    >
      {children}
    </button>
  );
}
