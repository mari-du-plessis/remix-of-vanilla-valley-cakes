import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OrderStatusSelect } from "./OrderStatusSelect";
import type { OrderStatus } from "../types";

export function OrderFiltersBar({
  status,
  search,
  onStatusChange,
  onSearchChange,
}: {
  status: OrderStatus | "all";
  search: string;
  onStatusChange: (status: OrderStatus | "all") => void;
  onSearchChange: (search: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, phone or order number"
          className="pl-9"
          maxLength={100}
        />
      </div>
      <OrderStatusSelect
        value={status}
        onChange={onStatusChange}
        includeAll
        className="sm:w-52"
      />
    </div>
  );
}
