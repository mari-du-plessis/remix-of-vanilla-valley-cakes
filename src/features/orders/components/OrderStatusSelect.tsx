import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUSES } from "../lib/status";
import type { OrderStatus } from "../types";

/** Lifecycle control — options are driven by ORDER_STATUSES, never hardcoded. */
export function OrderStatusSelect({
  value,
  onChange,
  disabled,
  includeAll,
  className,
}: {
  value: OrderStatus | "all";
  onChange: (value: OrderStatus | "all") => void;
  disabled?: boolean;
  includeAll?: boolean;
  className?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as OrderStatus | "all")}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value="all">All statuses</SelectItem>}
        {ORDER_STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
