import { cn } from "@/lib/utils";

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  size?: "sm" | "md";
  className?: string;
  id?: string;
};

/** Native select styled consistently across the app. */
export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  size = "md",
  className,
  id,
}: SelectFieldProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors",
        size === "sm" ? "h-11 px-3" : "h-12 px-4",
        className,
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
