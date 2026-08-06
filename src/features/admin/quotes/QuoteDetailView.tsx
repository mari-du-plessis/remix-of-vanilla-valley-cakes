import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, LoadingState } from "@/components/common";
import { buildWhatsAppLink } from "@/config/brand";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { formatOrderDate, formatOrderDateTime } from "@/features/orders/lib/format";
import { formatCents } from "@/features/pricing/lib/money";
import { QuoteLineEditor } from "@/features/quotes/components/QuoteLineEditor";
import type { QuoteLineEdit } from "@/features/quotes/components/QuoteLineEditor";
import { QuoteStatusBadge } from "@/features/quotes/components/QuoteStatusBadge";
import {
  useAddQuoteLine,
  useAddQuoteNote,
  useDeleteQuoteLine,
  useQuote,
  useSaveQuoteSettings,
  useUpdateQuoteLine,
} from "@/features/quotes/hooks/useQuotes";
import { downloadQuotePdf, openQuotePdf } from "@/features/quotes/lib/quote-pdf";
import {
  QUOTE_STATUS_FLOW,
  QUOTE_STATUS_LABELS,
  type QuoteStatus,
} from "@/features/quotes/types";

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="admin-heading text-xs text-muted-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Full quote editor: lines, totals, presentation copy, status and PDF output. */
export function QuoteDetailView({ quoteId }: { quoteId: string }) {
  const { data: quote, isPending, error } = useQuote(quoteId);
  const addLine = useAddQuoteLine();
  const updateLine = useUpdateQuoteLine();
  const deleteLine = useDeleteQuoteLine();
  const saveSettings = useSaveQuoteSettings();
  const addNote = useAddQuoteNote();

  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (!quote) return;
    setNotes(quote.notes ?? "");
    setTerms(quote.terms ?? "");
    setInternalNotes(quote.internalNotes ?? "");
  }, [quote?.id]);

  if (isPending) return <LoadingState label="Loading quote…" />;
  if (error || !quote)
    return (
      <EmptyState
        message={error ? `Could not load this quote — ${error.message}` : "Quote not found."}
        action={
          <Button asChild variant="outline">
            <Link to="/admin/quotes">Back to quotes</Link>
          </Button>
        }
      />
    );

  const readOnly = quote.status === "accepted" || quote.status === "archived";
  const busy = addLine.isPending || updateLine.isPending || deleteLine.isPending;

  const patch = (values: Record<string, unknown>) =>
    saveSettings.mutate({ id: quote.id, values } as never);

  return (
    <>
      <Link
        to="/admin/quotes"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> All quotes
      </Link>

      <AdminPageHeader
        title={`${quote.quoteNumber}${quote.revision > 1 ? ` · rev ${quote.revision}` : ""}`}
        description={`${quote.customerName ?? "Unknown customer"} · issued ${formatOrderDate(quote.quoteDate)}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openQuotePdf(quote)}>
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
            <Button size="sm" onClick={() => downloadQuotePdf(quote)}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Section
            title="Line items"
            action={<QuoteStatusBadge status={quote.status} />}
          >
            <QuoteLineEditor
              lines={quote.lines}
              currency={quote.currency}
              readOnly={readOnly}
              busy={busy}
              onUpdate={(id, values: QuoteLineEdit) => updateLine.mutate({ id, values })}
              onDelete={(id) => deleteLine.mutate(id)}
              onAdd={(values) => addLine.mutate({ quoteId: quote.id, ...values })}
            />

            <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatCents(quote.subtotalCents, quote.currency)}</dd>
              </div>
              {quote.discountCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd>- {formatCents(quote.discountCents, quote.currency)}</dd>
                </div>
              )}
              <div className="flex justify-between text-base font-medium">
                <dt>Total</dt>
                <dd>{formatCents(quote.totalCents, quote.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Deposit ({quote.depositPercent}%)
                </dt>
                <dd>{formatCents(quote.depositCents, quote.currency)}</dd>
              </div>
            </dl>
          </Section>

          <Section title="Shown on the PDF">
            <label className="mb-1 block text-xs text-muted-foreground">Notes</label>
            <Textarea
              rows={3}
              value={notes}
              maxLength={2000}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Anything the customer should know — delivery, collection, timing…"
            />
            <label className="mb-1 mt-4 block text-xs text-muted-foreground">
              Terms &amp; conditions
            </label>
            <Textarea
              rows={3}
              value={terms}
              maxLength={2000}
              onChange={(event) => setTerms(event.target.value)}
              placeholder="Deposit, cancellation and confirmation terms."
            />
            <Button
              className="mt-3"
              size="sm"
              disabled={
                saveSettings.isPending ||
                (notes === (quote.notes ?? "") && terms === (quote.terms ?? ""))
              }
              onClick={() => patch({ notes: notes || null, terms: terms || null })}
            >
              {saveSettings.isPending ? "Saving…" : "Save copy"}
            </Button>
          </Section>

          <Section title="Internal notes">
            <Textarea
              rows={3}
              value={internalNotes}
              maxLength={2000}
              onChange={(event) => setInternalNotes(event.target.value)}
              placeholder="Private working notes — never printed."
            />
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              disabled={
                saveSettings.isPending || internalNotes === (quote.internalNotes ?? "")
              }
              onClick={() => patch({ internalNotes: internalNotes || null })}
            >
              Save internal notes
            </Button>

            <div className="mt-5 space-y-3 border-t border-border pt-4">
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(event) => setNewNote(event.target.value)}
                  placeholder="Add a dated note…"
                  maxLength={2000}
                />
                <Button
                  size="sm"
                  disabled={!newNote.trim() || addNote.isPending}
                  onClick={() =>
                    addNote.mutate(
                      { quoteId: quote.id, body: newNote.trim() },
                      { onSuccess: () => setNewNote("") },
                    )
                  }
                >
                  Add
                </Button>
              </div>
              {quote.quoteNotes.map((note) => (
                <div key={note.id} className="rounded-xl bg-muted/50 p-3 text-sm">
                  <p className="whitespace-pre-wrap">{note.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatOrderDateTime(note.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Status">
            <select
              value={quote.status}
              aria-label="Quote status"
              onChange={(event) => patch({ status: event.target.value as QuoteStatus })}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            >
              {QUOTE_STATUS_FLOW.map((status) => (
                <option key={status} value={status}>
                  {QUOTE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            {readOnly && (
              <p className="mt-2 text-xs text-muted-foreground">
                Accepted and archived quotes are locked. Move it back to draft to edit.
              </p>
            )}
          </Section>

          <Section title="Validity">
            <label className="mb-1 block text-xs text-muted-foreground">Quote date</label>
            <Input
              type="date"
              defaultValue={quote.quoteDate}
              onBlur={(event) =>
                event.target.value && patch({ quoteDate: event.target.value })
              }
            />
            <label className="mb-1 mt-3 block text-xs text-muted-foreground">
              Valid until
            </label>
            <Input
              type="date"
              defaultValue={quote.validUntil ?? ""}
              onBlur={(event) => patch({ validUntil: event.target.value || null })}
            />
            <label className="mb-1 mt-3 block text-xs text-muted-foreground">
              Deposit %
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              defaultValue={quote.depositPercent}
              onBlur={(event) =>
                patch({
                  depositPercent: Math.min(
                    100,
                    Math.max(0, Number.parseInt(event.target.value, 10) || 0),
                  ),
                })
              }
            />
          </Section>

          <Section title="Customer">
            <div className="space-y-1 text-sm">
              <p className="font-medium">{quote.customerName ?? "Unknown"}</p>
              {quote.customerPhone && (
                <p className="text-muted-foreground">{quote.customerPhone}</p>
              )}
              {quote.customerEmail && (
                <p className="break-all text-muted-foreground">{quote.customerEmail}</p>
              )}
              {quote.orderNumber && (
                <Link
                  to="/admin/orders/$orderId"
                  params={{ orderId: quote.orderId }}
                  className="inline-block pt-1 text-primary"
                >
                  Order {quote.orderNumber}
                </Link>
              )}
            </div>
            {quote.customerPhone && (
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <a
                  href={buildWhatsAppLink(
                    `Hi ${quote.customerName ?? ""}, here is your quotation ${quote.quoteNumber} from Vanilla Valley.`,
                    quote.customerPhone.replace(/\D/g, ""),
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Send on WhatsApp
                </a>
              </Button>
            )}
          </Section>

          <Section title="History">
            <ol className="space-y-3 text-sm">
              {quote.history.map((event) => (
                <li key={event.id}>
                  <p>
                    {event.fromStatus
                      ? `${QUOTE_STATUS_LABELS[event.fromStatus]} → ${QUOTE_STATUS_LABELS[event.toStatus]}`
                      : `Created as ${QUOTE_STATUS_LABELS[event.toStatus]}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatOrderDateTime(event.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>
    </>
  );
}
