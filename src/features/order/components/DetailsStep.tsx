import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { FileDropField, SelectField } from "@/components/common";
import { ORDER_OCCASIONS } from "@/config/occasions";
import type { OrderFormState } from "../types";

type DetailsStepProps = {
  form: OrderFormState;
  /** Families that don't work from a reference photo hide the upload. */
  showInspiration?: boolean;
  /** Product-appropriate explanation of why a photo helps. */
  inspirationHint?: string;
  /**
   * Shorter workflows don't spend a whole screen on the occasion — they ask it
   * here as an optional field so the answer still reaches the bakery.
   */
  showOccasion?: boolean;
  onOccasionChange?: (value: string) => void;
  onInspirationChange: (file: File | null) => void;
  onEventDateChange: (value: string) => void;
  /** Removes a gallery photo the customer picked as inspiration. */
  onClearGalleryInspiration?: () => void;
};

export function DetailsStep({
  form,
  showInspiration = true,
  inspirationHint,
  showOccasion = false,
  onOccasionChange,
  onInspirationChange,
  onEventDateChange,
  onClearGalleryInspiration,
}: DetailsStepProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="space-y-5">
      <h2 className="text-3xl">When do you need it?</h2>

      {form.galleryInspiration && (
        <div className="surface-card flex items-start gap-3 rounded-2xl p-3">
          <img
            src={form.galleryInspiration.url}
            alt={form.galleryInspiration.caption ?? "The cake from our gallery you chose as inspiration"}
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
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {showOccasion && onOccasionChange && (
        <div>
          <Label htmlFor="occasion" className="mb-2 block">
            What's the occasion? <span className="text-muted-foreground">(optional)</span>
          </Label>
          <p id="occasion-hint" className="mb-2 text-xs leading-relaxed text-muted-foreground">
            It helps us suggest the right look, but you're welcome to skip it.
          </p>
          <SelectField
            id="occasion"
            value={form.occasion}
            onChange={onOccasionChange}
            options={ORDER_OCCASIONS}
            placeholder="Choose an occasion"
          />
        </div>
      )}

      {showInspiration && (
      <div>
        <Label htmlFor="inspiration" className="mb-2 block">
          Have a picture of something you like? <span className="text-muted-foreground">(optional)</span>
        </Label>
        <p id="inspiration-hint" className="mb-2 text-xs leading-relaxed text-muted-foreground">
          {inspirationHint ??
            "Upload it here so we can understand your idea — colours, decoration style, flowers, finish and any detail you love. We'll bake something in that direction, not an exact copy. You can carry on without one."}
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
              alt="The inspiration photo you uploaded"
              className="h-32 w-32 rounded-xl border border-border object-cover"
            />
          </div>
        )}
      </div>
      )}

      <div>
        <Label htmlFor="date" className="mb-2 block">
          When do you need it?
        </Label>
        <p id="date-hint" className="mb-2 text-xs leading-relaxed text-muted-foreground">
          The date of your event or collection.
        </p>
        <Input
          id="date"
          type="date"
          required
          aria-describedby="date-hint"
          value={form.eventDate}
          min={today}
          onChange={(e) => onEventDateChange(e.target.value)}
          className="h-12 rounded-xl"
        />
      </div>
    </section>
  );
}
