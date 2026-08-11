import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { FileDropField } from "@/components/common";
import type { OrderFormState } from "../types";

type DetailsStepProps = {
  form: OrderFormState;
  onInspirationChange: (file: File | null) => void;
  onEventDateChange: (value: string) => void;
  /** Removes a gallery photo the customer picked as inspiration. */
  onClearGalleryInspiration?: () => void;
};

export function DetailsStep({
  form,
  onInspirationChange,
  onEventDateChange,
  onClearGalleryInspiration,
}: DetailsStepProps) {
  return (
    <section className="space-y-5">
      <h2 className="text-3xl">The details</h2>

      {form.galleryInspiration && (
        <div className="surface-card flex items-start gap-3 rounded-2xl p-3">
          <img
            src={form.galleryInspiration.url}
            alt={form.galleryInspiration.caption ?? "Gallery inspiration"}
            loading="lazy"
            decoding="async"
            className="h-20 w-20 shrink-0 rounded-xl border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-[0.55rem] text-primary">
              From our gallery
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {form.galleryInspiration.caption ||
                "You picked one of our cakes as a reference — we'll design something in this direction, not a copy."}
            </p>
          </div>
          {onClearGalleryInspiration && (
            <button
              type="button"
              onClick={onClearGalleryInspiration}
              aria-label="Remove gallery inspiration"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="inspiration" className="mb-2 block">
          Add an inspiration photo (recommended)
        </Label>
        <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
          A photo helps us understand your colour scheme, decoration style, overall look, flower
          colours, finish, drip colour and any other visual details. You can continue without one
          — we'll simply work from your choices and notes.
        </p>
        <FileDropField
          id="inspiration"
          file={form.inspirationFile}
          onFileChange={onInspirationChange}
          placeholder="Tap to upload an image"
        />
        {form.inspirationPreview && (
          <div className="mt-3">
            <img
              src={form.inspirationPreview}
              alt="Inspiration preview"
              className="h-32 w-32 object-cover rounded-xl border border-border"
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="date" className="mb-2 block">
          Event date
        </Label>
        <Input
          id="date"
          type="date"
          value={form.eventDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => onEventDateChange(e.target.value)}
          className="h-12 rounded-xl"
        />
      </div>
    </section>
  );
}
