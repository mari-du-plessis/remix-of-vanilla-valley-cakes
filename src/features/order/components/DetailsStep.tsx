import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDropField } from "@/components/common";
import type { OrderFormState } from "../types";

type DetailsStepProps = {
  form: OrderFormState;
  onInspirationChange: (file: File | null) => void;
  onEventDateChange: (value: string) => void;
};

export function DetailsStep({
  form,
  onInspirationChange,
  onEventDateChange,
}: DetailsStepProps) {
  return (
    <section className="space-y-5">
      <h2 className="text-3xl">The details</h2>

      <div>
        <Label htmlFor="inspiration" className="mb-2 block">
          Inspiration photo (optional)
        </Label>
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
