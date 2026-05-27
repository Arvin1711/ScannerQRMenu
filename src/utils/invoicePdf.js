import { jsPDF } from "jspdf";

const PAGE_W = 100;
const MARGIN = 8;
const RIGHT = PAGE_W - MARGIN;
const CONTENT_W = RIGHT - MARGIN;

// Renders all invoice content into `doc` starting at y=10.
// Returns the final y position so callers can measure total height.
function renderContent(doc, data) {
  const {
    restaurantName, orderNum, entries, total, tableLabel,
    upiId, qrDataUrl, paymentStatus, paymentMethod,
  } = data;

  const isPaid = paymentStatus === "paid";
  const methodLabel = paymentMethod === "upi" ? "UPI" : "Cash";

  const dashLine = (yy, thick = false) => {
    if (thick) {
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.5);
    } else {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.25);
    }
    try { doc.setLineDash(thick ? [2, 2] : [1.5, 1.5]); } catch (_) {}
    doc.line(MARGIN, yy, RIGHT, yy);
    try { doc.setLineDash([]); } catch (_) {}
  };

  let y = 10;

  // ── Restaurant name ───────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(restaurantName || "Restaurant", PAGE_W / 2, y, { align: "center" });
  y += 6;

  // ── TAX INVOICE ───────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("TAX INVOICE", PAGE_W / 2, y, { align: "center" });
  y += 7;

  // ── Paid banner ───────────────────────────────────────────────────────────
  if (isPaid) {
    doc.setFillColor(22, 163, 74);
    doc.rect(MARGIN, y - 4, CONTENT_W, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`Payment Received  ${methodLabel}`, PAGE_W / 2, y, { align: "center" });
    y += 11;
  }

  dashLine(y);
  y += 6;

  // ── Meta ──────────────────────────────────────────────────────────────────
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice #${orderNum}`, MARGIN, y);
  doc.text(dateStr, RIGHT, y, { align: "right" });
  y += 6;
  doc.text(timeStr, MARGIN, y);
  if (tableLabel) doc.text(`Table: ${tableLabel}`, RIGHT, y, { align: "right" });
  y += 6;

  dashLine(y);
  y += 6;

  // ── Column headers ────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("ITEM", MARGIN, y);
  doc.text("QTY", PAGE_W * 0.62, y, { align: "center" });
  doc.text("PRICE", RIGHT, y, { align: "right" });
  y += 6;

  // ── Items ─────────────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  for (const { item, qty } of entries) {
    const nameLines = doc.splitTextToSize(item.name, CONTENT_W * 0.56);

    doc.setFont("helvetica", "bold");
    doc.text(nameLines, MARGIN, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`x${qty}`, PAGE_W * 0.62, y, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`Rs.${(item.price * qty).toFixed(0)}`, RIGHT, y, { align: "right" });

    y += nameLines.length * 5;

    if (item.variant) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`(${item.variant.label || item.variant})`, MARGIN, y);
      doc.setFontSize(10);
      y += 5;
    }
    y += 1.5;
  }

  y += 2;
  dashLine(y);
  y += 6;

  // ── Subtotals ─────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Subtotal", MARGIN, y);
  doc.text(`Rs.${total.toFixed(0)}`, RIGHT, y, { align: "right" });
  y += 6;
  doc.text("Taxes & charges", MARGIN, y);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.text("Ask staff", RIGHT, y, { align: "right" });
  y += 7;

  dashLine(y, true);
  y += 7;

  // ── TOTAL ─────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("TOTAL", MARGIN, y);
  doc.setTextColor(22, 163, 74);
  doc.text(`Rs.${total.toFixed(0)}`, RIGHT, y, { align: "right" });
  y += 9;

  // ── Thank you ─────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("--- THANK YOU ---", PAGE_W / 2, y, { align: "center" });
  y += 9;

  // ── UPI QR block ──────────────────────────────────────────────────────────
  if (qrDataUrl && upiId) {
    dashLine(y);
    y += 6;

    const QR_SIZE = 46;
    doc.addImage(qrDataUrl, "PNG", (PAGE_W - QR_SIZE) / 2, y, QR_SIZE, QR_SIZE);
    y += QR_SIZE + 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Scan to pay via UPI", PAGE_W / 2, y, { align: "center" });
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(upiId, PAGE_W / 2, y, { align: "center" });
    y += 8;
  }

  dashLine(y);
  y += 6;

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Please present this invoice to staff", PAGE_W / 2, y, { align: "center" });
  y += 5;
  doc.text("Taxes will be added as per actuals", PAGE_W / 2, y, { align: "center" });
  y += 5;
  doc.text("Powered by QR Menu", PAGE_W / 2, y, { align: "center" });
  y += 10;

  return y;
}

export async function generateInvoicePdfFile(data) {
  // Pass 1: measure exact page height using a tall throwaway doc
  const ruler = new jsPDF({ unit: "mm", format: [PAGE_W, 500] });
  const pageHeight = renderContent(ruler, data);

  // Pass 2: render to a page that fits the content exactly
  const doc = new jsPDF({ unit: "mm", format: [PAGE_W, pageHeight] });
  renderContent(doc, data);

  const blob = doc.output("blob");
  return new File([blob], `invoice-${data.orderNum}.pdf`, { type: "application/pdf" });
}
