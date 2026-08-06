type CategoryTabsProps = {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
};

export function CategoryTabs({ tabs, active, onChange }: CategoryTabsProps) {
  return (
    <div className="px-4 mb-4 overflow-x-auto">
      <div className="flex gap-2 max-w-4xl mx-auto w-max">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={
              "whitespace-nowrap rounded-full border px-4 py-2 text-[0.65rem] uppercase tracking-[0.16em] transition-colors " +
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
