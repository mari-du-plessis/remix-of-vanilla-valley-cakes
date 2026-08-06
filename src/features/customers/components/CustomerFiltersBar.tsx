import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CUSTOMER_SORTS, CUSTOMER_STATUSES } from "../lib/customer-meta";
import type { CustomerSort, CustomerStatus } from "../types";

function Select({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-10 rounded-md border border-input bg-background px-3 text-sm ${className ?? ""}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function CustomerFiltersBar({
  search,
  status,
  tag,
  sort,
  tags,
  onSearchChange,
  onStatusChange,
  onTagChange,
  onSortChange,
}: {
  search: string;
  status: CustomerStatus | "all";
  tag: string | null;
  sort: CustomerSort;
  tags: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CustomerStatus | "all") => void;
  onTagChange: (value: string | null) => void;
  onSortChange: (value: CustomerSort) => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, phone, email or tag"
          className="pl-9"
          maxLength={100}
        />
      </div>
      <Select
        label="Filter by status"
        value={status}
        onChange={(value) => onStatusChange(value as CustomerStatus | "all")}
        className="lg:w-44"
        options={[
          { value: "all", label: "All statuses" },
          ...CUSTOMER_STATUSES.map((s) => ({ value: s.value, label: s.label })),
        ]}
      />
      <Select
        label="Filter by tag"
        value={tag ?? "all"}
        onChange={(value) => onTagChange(value === "all" ? null : value)}
        className="lg:w-40"
        options={[
          { value: "all", label: "All tags" },
          ...tags.map((t) => ({ value: t, label: t })),
        ]}
      />
      <Select
        label="Sort customers"
        value={sort}
        onChange={(value) => onSortChange(value as CustomerSort)}
        className="lg:w-44"
        options={CUSTOMER_SORTS.map((s) => ({ value: s.value, label: s.label }))}
      />
    </div>
  );
}
