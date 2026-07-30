import { ORDER_OCCASIONS } from "@/config/occasions";
import { SelectableCard } from "@/components/common";

type OccasionStepProps = {
  value: string;
  onChange: (occasion: string) => void;
};

export function OccasionStep({ value, onChange }: OccasionStepProps) {
  return (
    <section className="space-y-5">
      <h2 className="text-3xl">What's the occasion?</h2>
      <div className="grid grid-cols-2 gap-2">
        {ORDER_OCCASIONS.map((o) => (
          <SelectableCard
            key={o}
            selected={value === o}
            onSelect={() => onChange(o)}
            className="p-4 text-sm"
          >
            {o}
          </SelectableCard>
        ))}
      </div>
    </section>
  );
}
