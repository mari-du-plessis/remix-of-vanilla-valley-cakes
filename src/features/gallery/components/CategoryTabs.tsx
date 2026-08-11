type CategoryTabsProps = {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
  /** Accessible name for the filter group. */
  label?: string;
};

/**
 * Horizontal category filter used by the public gallery. Buttons carry
 * `aria-pressed` so assistive tech announces the active filter, and each pill
 * clears the 44px mobile tap target.
 */
export function CategoryTabs({
  tabs,
  active,
  onChange,
  label = "Filter by category",
}: CategoryTabsProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="mb-6 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto flex w-max max-w-4xl gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            aria-pressed={active === t}
            className={
              "min-h-11 whitespace-nowrap rounded-full border px-5 text-[0.65rem] uppercase tracking-[0.16em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
              (active === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card/50 text-muted-foreground hover:border-primary/50 hover:text-foreground")
            }
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
