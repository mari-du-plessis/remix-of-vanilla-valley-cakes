import { useState } from "react";
import { BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderFormState } from "@/features/order/types";
import { useSaveDesign } from "../hooks/useSavedDesigns";

/**
 * "Save this design" — the single entry point into Saved Designs from the
 * builder. It saves the structured configuration only; the customer's contact
 * details and event date stay with the enquiry.
 */
export function SaveDesignDialog({
  form,
  designId,
  suggestedName,
  onSaved,
}: {
  form: OrderFormState;
  /** Set while editing an existing design, so saving updates it in place. */
  designId?: string | null;
  suggestedName?: string;
  onSaved?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { mutateAsync, isPending, canSave } = useSaveDesign();

  const fallbackName = suggestedName?.trim() || "My cake design";

  const submit = async () => {
    const saved = await mutateAsync({
      id: designId ?? null,
      name: name.trim() || fallbackName,
      form,
    });
    setOpen(false);
    setName("");
    onSaved?.(saved.id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 flex-1 rounded-full" disabled={!canSave}>
          <BookmarkPlus className="mr-2 h-4 w-4" />
          {designId ? "Update saved design" : "Save design"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{designId ? "Update your design" : "Save your design"}</DialogTitle>
          <DialogDescription>
            We'll keep this design on this device so you can come back, adjust it or send it to us
            whenever you're ready.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="design-name">Design name</Label>
          <Input
            id="design-name"
            value={name}
            placeholder={fallbackName}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full">
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending} className="rounded-full">
            {isPending ? "Saving…" : "Save design"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
