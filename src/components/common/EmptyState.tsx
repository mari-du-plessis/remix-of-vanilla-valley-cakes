import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  message,
  action,
  className,
}: {
  message: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
