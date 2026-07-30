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
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium border transition-colors " +
              (active === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:text-foreground")
            }
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
