import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSection } from "@/features/admin/components/AdminSection";
import { useCakeCatalog } from "@/features/catalog/hooks/useCakeCatalog";
import { CakeBuilderPreview } from "@/features/cake-builder/components/CakeBuilderPreview";
import { designSignature, describeSnapshot, snapshotToForm } from "@/features/saved-designs/lib/snapshot";
import {
  useAdminTemplates,
  useTemplateMutations,
} from "@/features/cake-templates/hooks/useCakeTemplates";
import type { CakeTemplate } from "@/features/cake-templates/types";
import { TemplateEditor } from "./TemplateEditor";

/**
 * Admin Cake Templates.
 *
 * Everything Sonja needs to curate starting designs — create, edit, duplicate,
 * reorder, feature, hide and delete — without touching SVG tokens or any other
 * internal detail. Previews are rendered from each template's configuration
 * through the shared renderer, so this list is always truthful.
 */
export function TemplatesManager() {
  const { catalog } = useCakeCatalog();
  const { data: templates = [], isLoading } = useAdminTemplates();
  const { create, update, patch, duplicate, remove, reorder } = useTemplateMutations();

  const [editing, setEditing] = useState<CakeTemplate | null>(null);
  const [open, setOpen] = useState(false);

  const startNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const move = (index: number, dir: -1 | 1) => {
    const other = index + dir;
    if (other < 0 || other >= templates.length) return;
    reorder.mutate({ a: templates[index]!, b: templates[other]! });
  };

  const confirmDelete = (template: CakeTemplate) => {
    if (
      !confirm(
        `Delete "${template.name}"? Customer designs and orders that started from it are kept — only the template is removed.`,
      )
    )
      return;
    remove.mutate(template.id);
  };

  return (
    <>
      <AdminSection
        title={`Templates (${templates.length})`}
        description="Curated starting designs customers can make their own. The design itself — not a picture — is what is stored."
        action={
          <Button onClick={startNew}>
            <Plus className="mr-2 h-4 w-4" /> Create template
          </Button>
        }
      >
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && templates.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No templates yet. Create your first starting design.
          </p>
        )}

        <div className="space-y-3">
          {templates.map((template, index) => {
            const form = snapshotToForm(template.design);
            const conceptStale =
              !!template.aiPreviewUrl &&
              template.aiPreviewSignature !== designSignature(template.design);

            return (
              <div
                key={template.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted/40">
                  <CakeBuilderPreview form={form} catalog={catalog} className="h-24 w-24" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{template.name}</p>
                    {template.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[0.6rem] text-primary">
                        <Sparkles className="h-3 w-3" /> Featured
                      </span>
                    )}
                    {!template.isActive && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[0.6rem] text-muted-foreground">
                        Hidden
                      </span>
                    )}
                    {conceptStale && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[0.6rem] text-destructive">
                        <TriangleAlert className="h-3 w-3" /> Concept out of date
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {template.description || describeSnapshot(template.design)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {template.category || "Uncategorised"} · Order: {template.sortOrder}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Move up"
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Move down"
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={template.isActive ? "Hide from customers" : "Show to customers"}
                    onClick={() =>
                      patch.mutate({ id: template.id, patch: { is_active: !template.isActive } })
                    }
                  >
                    {template.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={template.isFeatured ? "Remove from featured" : "Mark as featured"}
                    onClick={() =>
                      patch.mutate({
                        id: template.id,
                        patch: { is_featured: !template.isFeatured },
                      })
                    }
                  >
                    <Sparkles
                      className={
                        template.isFeatured ? "h-4 w-4 text-primary" : "h-4 w-4 opacity-60"
                      }
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Duplicate template"
                    onClick={() => duplicate.mutate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit template"
                    onClick={() => {
                      setEditing(template);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete template"
                    onClick={() => confirmDelete(template)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </AdminSection>

      <TemplateEditor
        open={open}
        template={editing}
        saving={create.isPending || update.isPending}
        onClose={() => setOpen(false)}
        onSave={(input) => {
          const mutation = editing
            ? update.mutateAsync({ id: editing.id, input })
            : create.mutateAsync(input);
          void mutation.then(() => setOpen(false)).catch(() => {});
        }}
      />
    </>
  );
}
