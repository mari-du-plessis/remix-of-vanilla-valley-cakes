import { jsPDF } from "jspdf";
import { BRAND } from "@/config/brand";
import { formatCents } from "@/features/pricing/lib/money";
import type { QuoteDetail } from "../types";

/**
 * Renders a quotation PDF client-side. Kept free of React so it can later be
 * reused for invoices and order confirmations.
 */

const MARGIN = 48;
const INK = "#1a1a1a";
const MUTED = "#6b6b6b";
const GOLD = "#a8853f";

const sanitise = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/** `Vanilla-Valley-Quote-VVQ-2026-0001-Jane-Smith.pdf` */
export function quoteFileName(quote: QuoteDetail) {
  return [
    sanitise(BRAND.name),
    "Quote",
    quote.quoteNumber,
    quote.customerName ? sanitise(quote.customerName) : null,
  ]
    .filter(Boolean)
    .join("-")
    .concat(".pdf");
}

const formatDate = (value: string | null) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

export function buildQuotePdf(quote: QuoteDetail) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const right = pageWidth - MARGIN;
  let y = MARGIN;

  const line = () => {
    doc.setDrawColor(224, 224, 224);
    doc.line(MARGIN, y, right, y);
    y += 18;
  };

  const pageBreak = (needed = 60) => {
    if (y + needed <= pageHeight - MARGIN) return;
    doc.addPage();
    y = MARGIN;
  };

  /* header */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(INK);
  doc.text(BRAND.name, MARGIN, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text(BRAND.tagline, MARGIN, y + 14);
  doc.text(`WhatsApp +${BRAND.whatsappNumber}`, MARGIN, y + 27);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(GOLD);
  doc.text("QUOTATION", right, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text(
    `${quote.quoteNumber}${quote.revision > 1 ? ` · rev ${quote.revision}` : ""}`,
    right,
    y + 14,
    { align: "right" },
  );
  doc.text(`Issued ${formatDate(quote.quoteDate)}`, right, y + 27, { align: "right" });
  if (quote.validUntil)
    doc.text(`Valid until ${formatDate(quote.validUntil)}`, right, y + 40, {
      align: "right",
    });

  y += 62;
  line();

  /* customer + event */
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text("PREPARED FOR", MARGIN, y);
  doc.text("EVENT", pageWidth / 2, y);
  y += 14;
  doc.setTextColor(INK);
  doc.setFontSize(11);
  doc.text(quote.customerName ?? "—", MARGIN, y);
  doc.text(quote.occasion ?? "—", pageWidth / 2, y);
  y += 14;
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  if (quote.customerPhone) doc.text(quote.customerPhone, MARGIN, y);
  doc.text(
    quote.eventDate ? formatDate(quote.eventDate) : "Date to be confirmed",
    pageWidth / 2,
    y,
  );
  y += 14;
  if (quote.customerEmail) {
    doc.text(quote.customerEmail, MARGIN, y);
    y += 14;
  }
  if (quote.orderNumber) {
    doc.text(`Order ${quote.orderNumber}`, pageWidth / 2, y - 14);
  }
  y += 8;
  line();

  /* table header */
  const qtyX = right - 200;
  const unitX = right - 120;
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text("DESCRIPTION", MARGIN, y);
  doc.text("QTY", qtyX, y, { align: "right" });
  doc.text("UNIT", unitX, y, { align: "right" });
  doc.text("AMOUNT", right, y, { align: "right" });
  y += 12;
  line();

  /* lines */
  for (const item of quote.lines) {
    pageBreak(50);
    doc.setFontSize(10);
    doc.setTextColor(INK);
    const label = doc.splitTextToSize(item.label, qtyX - MARGIN - 16) as string[];
    doc.text(label, MARGIN, y);
    doc.text(String(item.quantity), qtyX, y, { align: "right" });
    doc.text(formatCents(item.unitCents, quote.currency), unitX, y, { align: "right" });
    doc.text(formatCents(item.amountCents, quote.currency), right, y, { align: "right" });
    y += label.length * 12;
    if (item.detail) {
      doc.setFontSize(8);
      doc.setTextColor(MUTED);
      const detail = doc.splitTextToSize(item.detail, qtyX - MARGIN - 16) as string[];
      doc.text(detail, MARGIN, y);
      y += detail.length * 10;
    }
    y += 8;
  }

  y += 4;
  line();

  /* totals */
  const totalRow = (label: string, value: string, bold = false) => {
    pageBreak(40);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 12 : 10);
    doc.setTextColor(bold ? INK : MUTED);
    doc.text(label, unitX, y, { align: "right" });
    doc.setTextColor(INK);
    doc.text(value, right, y, { align: "right" });
    y += bold ? 20 : 16;
    doc.setFont("helvetica", "normal");
  };

  totalRow("Subtotal", formatCents(quote.subtotalCents, quote.currency));
  if (quote.discountCents > 0)
    totalRow("Discount", `- ${formatCents(quote.discountCents, quote.currency)}`);
  totalRow("Total", formatCents(quote.totalCents, quote.currency), true);
  if (quote.depositCents > 0)
    totalRow(`Deposit (${quote.depositPercent}%)`, formatCents(quote.depositCents, quote.currency));

  /* notes and terms */
  const block = (title: string, body: string) => {
    pageBreak(80);
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 14;
    doc.setFontSize(9);
    doc.setTextColor(INK);
    const text = doc.splitTextToSize(body, right - MARGIN) as string[];
    doc.text(text, MARGIN, y);
    y += text.length * 12;
  };

  if (quote.notes) block("Notes", quote.notes);
  if (quote.terms) block("Terms & conditions", quote.terms);

  /* footer */
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(`${BRAND.legalName} · quotation ${quote.quoteNumber}`, MARGIN, pageHeight - 28);
    doc.text(`Page ${page} of ${pages}`, right, pageHeight - 28, { align: "right" });
  }

  return doc;
}

export function downloadQuotePdf(quote: QuoteDetail) {
  buildQuotePdf(quote).save(quoteFileName(quote));
}

export function openQuotePdf(quote: QuoteDetail) {
  const url = buildQuotePdf(quote).output("bloburl");
  window.open(url, "_blank");
}
