import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SelectField } from "@/components/common";
import { GALLERY_CATEGORIES } from "@/config/occasions";
import { useCakeCatalog } from "@/features/catalog/hooks/useCakeCatalog";
import { GuidedCakeBuilder } from "@/features/cake-builder/components/GuidedCakeBuilder";
import { useGuidedBuilder } from "@/features/cake-builder/hooks/useGuidedBuilder";
import { generateInspirationPreview } from "@/features/cake-builder/api/inspiration.functions";
import { buildInspirationInput } from "@/features/cake-builder/lib/inspiration";
import { useOrderForm } from "@/features/order/hooks/useOrderForm";
import { EMPTY_ORDER_FORM } from "@/features/order/types";
import { designSignature, snapshotToForm, toSnapshot } from "@/features/saved-designs/lib/snapshot";
import { TEMPLATE_PRODUCT_SLUG, type CakeTemplate } from "@/features/cake-templates/types";
import type { TemplateInput } from "@/features/cake-templates/api";

/**
 * Admin template editor.
 *
 * It reuses the *customer* cake builder rather than introducing a second one:
 * the same steps, the same asset library and the same renderer, driven by the
 * same order-form state. Whatever Sonja can design here is exactly what a
 * customer can design, which is the point of a template.
 */
export function TemplateEditor({
  open,
  template,
  saving,
  onSave,
  onClose,
}: {
  open: boolean;
  /** null = creating a new template. */
  template: CakeTemplate | null;
  saving: boolean;
  onSave: (input: TemplateInput) => void;
  onClose: () => void;
}) {
  const { catalog } = useCakeCatalog();
  const order = useOrderForm(catalog);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(null);
  const [aiPreviewSignature, setAiPreviewSignature] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generate = useServerFn(generateInspirationPreview);

  /* Load the record (or a blank custom cake) whenever the editor opens. */
  useEffect(() => {
    if (!open) return;
    setName(template?.name ?? "");
    setDescription(template?.description ?? "");
    setCategory(template?.category ?? "");
    setIsFeatured(template?.isFeatured ?? false);
    setIsActive(template?.isActive ?? true);
    setAiPreviewUrl(template?.aiPreviewUrl ?? null);
    setAiPreviewSignature(template?.aiPreviewSignature ?? null);
    order.loadForm(
      template
        ? snapshotToForm(template.design)
        : { ...EMPTY_ORDER_FORM, product: TEMPLATE_PRODUCT_SLUG },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, template?.id]);

  const builder = useGuidedBuilder(order.form, catalog, order);

  const snapshot = useMemo(() => toSnapshot(order.form), [order.form]);
  const signature = designSignature(snapshot);
  /** A concept drawn from an older configuration is flagged, never hidden. */
  const conceptStale = !!aiPreviewUrl && aiPreviewSignature !== signature;

  const generateConcept = async () => {
    setGenerating(true);
    try {
      const result = await generate({
        data: buildInspirationInput(order.form, catalog, { notes: description }),
      });
      setAiPreviewUrl(result.url);
      setAiPreviewSignature(signature);
      toast.success("Concept generated — remember to save the template");
    } catch {
      toast.error("The concept could not be generated. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const save = () => {
    if (!name.trim()) return toast.error("Please give the template a name");
    if (!order.form.size) return toast.error("Please choose a size for the template");
    onSave({
      name,
      description,
      category,
      design: snapshot,
      isFeatured,
      isActive,
      aiPreviewUrl,
      /* Keep the fingerprint so a later design change marks it stale. */
      aiPreviewSignature: aiPreviewUrl ? (aiPreviewSignature ?? signature) : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="admin-heading">
            {template ? "Edit template" : "New template"}
          </DialogTitle>
          <DialogDescription>
            Design the cake exactly as a customer would, then give it a name customers will
            recognise. Customers always start from a copy — this template is never changed by them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template name</Label>
              <Input
                id="template-name"
                value={name}
                maxLength={80}
                placeholder="e.g. Elegant Blush & Gold"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <SelectField
              label="Category"
              value={category}
              onChange={setCategory}
              options={[
                { value: "", label: "Uncategorised" },
                ...GALLERY_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={description}
              maxLength={400}
              rows={3}
              placeholder="Three-tier buttercream cake with blush tiers, gold drip and fresh-style flowers."
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              Visible to customers
            </label>
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              Featured
            </label>
          </div>

          <div className="rounded-2xl border border-border/70 p-4">
            <h3 className="admin-heading text-sm">Concept illustration (optional)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              An artistic AI illustration of this design. It is only ever a representation — the
              configuration below stays the source of truth, and it is never regenerated on its own.
            </p>
            {conceptStale && (
              <p className="mt-3 flex items-center gap-2 text-sm text-destructive">
                <TriangleAlert className="h-4 w-4" />
                The design has changed since this concept was generated.
              </p>
            )}
            <div className="mt-3 flex items-center gap-4">
              {aiPreviewUrl && (
                <img
                  src={aiPreviewUrl}
                  alt="Template concept illustration"
                  className="h-24 w-24 rounded-lg object-cover"
                />
              )}
              <Button
                type="button"
                variant="outline"
                disabled={generating}
                onClick={generateConcept}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {generating ? "Generating…" : aiPreviewUrl ? "Regenerate concept" : "Generate concept"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 p-4">
            <GuidedCakeBuilder
              form={order.form}
              catalog={catalog}
              builder={builder}
              onCakeTextChange={(v) => order.update("cakeText", v)}
              onAppearanceChange={(v) => order.update("appearance", v)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : template ? "Save template" : "Create template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
