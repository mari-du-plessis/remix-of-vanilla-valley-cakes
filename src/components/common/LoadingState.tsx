import { cn } from "@/lib/utils";

export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <p className={cn("text-center text-sm text-muted-foreground", className)}>{label}</p>
  );
}
