import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type OptionPillProps = {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  size?: "sm" | "md";
  className?: string;
};

/** Rounded pill option used for flavour selection. */
export function OptionPill({
  selected,
  onSelect,
  children,
  size = "md",
  className,
}: OptionPillProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "rounded-full border transition-all duration-300",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        selected
          ? "border-primary bg-primary/12 text-foreground shadow-[var(--shadow-soft)]"
          : "border-border bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}
