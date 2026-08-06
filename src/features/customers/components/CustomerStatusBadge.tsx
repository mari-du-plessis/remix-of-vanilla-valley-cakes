import { cn } from "@/lib/utils";
import { getCustomerStatusMeta } from "../lib/customer-meta";
import type { CustomerStatus } from "../types";

export function CustomerStatusBadge({
  status,
  className,
}: {
  status: CustomerStatus;
  className?: string;
}) {
  const meta = getCustomerStatusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        meta.className,
        className,
      )}
      title={meta.description}
    >
      {meta.label}
    </span>
  );
}
