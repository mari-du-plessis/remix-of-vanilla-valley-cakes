import { useState, type ReactNode } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CatalogRow = { id: string; is_active?: boolean };

/**
 * Reusable "list + inline editor" shell used by every catalog manager
 * (categories, products, option groups, options). Callers supply how a row
 * renders and what the editor form looks like; selection, create/edit toggling
 * and delete confirmation are handled here once.
 */
export function CatalogCrudList<T extends CatalogRow>({
  rows,
  loading,
  emptyMessage,
  addLabel,
  renderRow,
  renderForm,
  onDelete,
  selectedId,
  onSelect,
}: {
  rows: T[];
  loading?: boolean;
  emptyMessage: string;
  addLabel: string;
  renderRow: (row: T) => ReactNode;
  renderForm: (row: T | null, close: () => void) => ReactNode;
  onDelete?: (row: T) => void;
  selectedId?: string | null;
  onSelect?: (row: T) => void;
}) {
  const [editing, setEditing] = useState<{ row: T | null } | null>(null);
  const close = () => setEditing(null);

  return (
    <div className="space-y-4">
      {editing ? (
        <div className="rounded-xl border border-border/70 bg-background/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">{editing.row ? "Edit" : addLabel}</p>
            <Button variant="ghost" size="sm" onClick={close} aria-label="Cancel">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {renderForm(editing.row, close)}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setEditing({ row: null })}
        >
          <Plus className="mr-1 h-4 w-4" /> {addLabel}
        </Button>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-border/70 rounded-xl border border-border/70">
          {rows.map((row) => (
            <li
              key={row.id}
              className={`flex items-center justify-between gap-3 px-4 py-3 ${
                onSelect ? "cursor-pointer" : ""
              } ${selectedId === row.id ? "bg-muted/50" : ""}`}
              onClick={onSelect ? () => onSelect(row) : undefined}
            >
              <div className="min-w-0 flex-1">{renderRow(row)}</div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing({ row });
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this item? This cannot be undone.")) onDelete(row);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
