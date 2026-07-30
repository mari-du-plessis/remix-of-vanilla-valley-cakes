import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type FileDropFieldProps = {
  id: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  placeholder?: string;
  accept?: string;
  required?: boolean;
  showSize?: boolean;
  variant?: "inline" | "block";
  className?: string;
};

/**
 * Shared "tap to upload" field. Used by the customer inspiration upload and
 * the admin gallery uploader.
 */
export function FileDropField({
  id,
  file,
  onFileChange,
  placeholder = "Tap to upload an image",
  accept = "image/*",
  required,
  showSize = false,
  variant = "inline",
  className,
}: FileDropFieldProps) {
  return (
    <>
      <label
        htmlFor={id}
        className={cn(
          "cursor-pointer transition-colors",
          variant === "inline"
            ? "flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-2xl hover:border-primary/60 text-sm text-muted-foreground"
            : "flex flex-col items-center justify-center gap-2 w-full py-8 rounded-md border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50",
          className,
        )}
      >
        <Upload className={variant === "inline" ? "h-4 w-4" : "w-6 h-6 text-muted-foreground"} />
        <span className={variant === "inline" ? undefined : "text-sm font-medium"}>
          {file?.name || placeholder}
        </span>
        {showSize && file && (
          <span className="text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        )}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        required={required}
        className={variant === "inline" ? "hidden" : "sr-only"}
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </>
  );
}
