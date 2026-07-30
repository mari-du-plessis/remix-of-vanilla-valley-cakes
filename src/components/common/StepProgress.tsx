import { cn } from "@/lib/utils";

type StepProgressProps = {
  steps: readonly string[];
  current: number;
  className?: string;
};

/** Thin multi-step progress indicator used by the order wizard. */
export function StepProgress({ steps, current, className }: StepProgressProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {steps.map((s, i) => (
        <div key={s} className="flex-1">
          <div className={cn("h-1 rounded-full", i <= current ? "bg-primary" : "bg-border")} />
          <p
            className={cn(
              "text-[10px] mt-2 tracking-wider uppercase",
              i === current ? "text-primary" : "text-muted-foreground",
            )}
          >
            {s}
          </p>
        </div>
      ))}
    </div>
  );
}
