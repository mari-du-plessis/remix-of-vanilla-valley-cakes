import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common";
import { formatOrderDateTime } from "@/features/orders/lib/format";
import type { CustomerNote } from "../types";

/**
 * Chronological internal note trail. Kept separate from the customer's
 * summary note so future modules (reviews, loyalty, marketing) can append
 * their own entries to the same timeline.
 */
export function CustomerNotesPanel({
  notes,
  saving,
  onAdd,
  onDelete,
}: {
  notes: CustomerNote[];
  saving?: boolean;
  onAdd: (body: string) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <Textarea
          rows={3}
          maxLength={4000}
          value={draft}
          placeholder="Add an internal note — never shown to the customer."
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button
          size="sm"
          className="mt-2 rounded-full"
          disabled={!draft.trim() || saving}
          onClick={() => {
            onAdd(draft.trim());
            setDraft("");
          }}
        >
          {saving ? "Saving…" : "Add note"}
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyState message="No notes yet." />
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-border/70 bg-background/60 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="whitespace-pre-wrap text-sm">{note.body}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Delete note"
                  onClick={() => onDelete(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatOrderDateTime(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
