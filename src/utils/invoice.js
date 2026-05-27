// ── Thermal-receipt HTML (for print / download) ──────────────────────────────
export function downloadInvoice({
  restaurantName,
  orderNum,
  entries,
  total,
  tableLabel,
  itemNotes,
  upiId,
  qrDataUrl,
}) {
  const date = new Date();
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const rows = entries
    .map(
      ({ item, qty }) => `
    <tr>
      <td class="item-name">${item.name}${item.variant ? ` <span class="variant">(${item.variant.label})</span>` : ""}</td>
      <td class="item-qty">×${qty}</td>
      <td class="item-price">₹${(item.price * qty).toFixed(0)}</td>
    </tr>
    ${itemNotes?.[item.id] ? `<tr class="note-row"><td colspan="3" class="item-note">📝 ${itemNotes[item.id]}</td></tr>` : ""}
  `,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Invoice #${orderNum} — ${restaurantName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', Courier, monospace; background: #fff; color: #111; padding: 32px 24px; max-width: 380px; margin: 0 auto; }
  .logo { text-align: center; margin-bottom: 6px; font-size: 22px; font-weight: 800; font-family: -apple-system, sans-serif; letter-spacing: -0.03em; }
  .divider { border: none; border-top: 1px dashed #bbb; margin: 14px 0; }
  .divider-solid { border: none; border-top: 2px solid #111; margin: 14px 0; }
  .meta { font-size: 11px; color: #444; margin-bottom: 3px; }
  .meta b { color: #111; }
  .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #777; margin-bottom: 10px; font-family: sans-serif; }
  table { width: 100%; border-collapse: collapse; }
  td { vertical-align: top; padding: 5px 0; font-size: 13px; line-height: 1.4; }
  .item-name { width: 55%; word-break: break-word; font-family: sans-serif; }
  .item-qty { width: 15%; text-align: center; color: #555; font-family: sans-serif; }
  .item-price { width: 30%; text-align: right; font-weight: 600; font-family: sans-serif; }
  .variant { font-size: 10px; color: #888; font-style: italic; }
  .note-row td { padding: 0 0 6px; }
  .item-note { font-size: 10px; color: #888; font-style: italic; font-family: sans-serif; }
  .subtotal-row td { font-size: 12px; color: #555; padding: 3px 0; font-family: sans-serif; }
  .total-row td { font-size: 16px; font-weight: 800; padding: 6px 0; font-family: -apple-system, sans-serif; }
  .tax-note { font-size: 10px; color: #888; font-family: sans-serif; }
  .footer { text-align: center; margin-top: 24px; font-size: 10px; color: #888; line-height: 1.7; font-family: sans-serif; }
  .thank-you { text-align: center; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; margin: 16px 0 4px; font-family: -apple-system, sans-serif; }
  .pay-qr { text-align: center; margin: 18px 0 0; }
  .pay-qr img { width: 130px; height: 130px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px; }
  .pay-qr-label { font-size: 10px; color: #888; margin-top: 6px; font-family: sans-serif; }
  .pay-qr-id { font-size: 12px; font-weight: 700; color: #111; margin-top: 3px; font-family: sans-serif; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="logo">${restaurantName || "Restaurant"}</div>
  <hr class="divider"/>
  <p class="meta">Invoice <b>#${orderNum}</b></p>
  <p class="meta">Date: <b>${dateStr}</b> &nbsp; Time: <b>${timeStr}</b></p>
  ${tableLabel ? `<p class="meta">Table: <b>${tableLabel}</b></p>` : ""}
  <hr class="divider"/>
  <p class="section-title">Order Items</p>
  <table><tbody>${rows}</tbody></table>
  <hr class="divider"/>
  <table>
    <tbody>
      <tr class="subtotal-row"><td>Subtotal</td><td></td><td style="text-align:right">₹${total.toFixed(0)}</td></tr>
      <tr class="subtotal-row"><td>Taxes &amp; charges</td><td></td><td style="text-align:right" class="tax-note">Ask staff</td></tr>
    </tbody>
  </table>
  <hr class="divider-solid"/>
  <table>
    <tbody>
      <tr class="total-row"><td>TOTAL</td><td></td><td style="text-align:right">₹${total.toFixed(0)}</td></tr>
    </tbody>
  </table>
  <p class="thank-you">✦ THANK YOU ✦</p>
  <hr class="divider"/>
  ${qrDataUrl && upiId ? `<div class="pay-qr">
    <img src="${qrDataUrl}" alt="UPI QR Code"/>
    <p class="pay-qr-label">Scan to pay via UPI</p>
    <p class="pay-qr-id">${upiId}</p>
  </div>
  <hr class="divider"/>` : ""}
  <p class="footer">Please present this invoice to staff<br/>Taxes will be added as per actuals<br/>Powered by QR Menu</p>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

// ── Shareable card HTML (WhatsApp / Email) ────────────────────────────────────
// Matches the invoice modal design exactly — white card, dashed dividers,
// green total, gray QR block. Self-contained; opens correctly in any browser.
export function generateShareableHtml({
  restaurantName,
  orderNum,
  entries,
  total,
  tableLabel,
  upiId,
  qrDataUrl,
  paymentStatus,
  paymentMethod,
}) {
  const date = new Date();
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const isPaid = paymentStatus === "paid";
  const methodLabel = paymentMethod === "upi" ? "UPI" : "Cash";

  const itemRows = entries
    .map(
      ({ item, qty }) => `
      <div class="item">
        <div class="item-left">
          <span class="item-name">${item.name}</span>
          ${item.variant ? `<span class="item-variant">(${item.variant.label || item.variant})</span>` : ""}
        </div>
        <span class="item-qty">×${qty}</span>
        <span class="item-price">₹${(item.price * qty).toFixed(0)}</span>
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Invoice #${orderNum} — ${restaurantName || "Restaurant"}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    background:#f1f5f9;
    min-height:100vh;
    display:flex;
    align-items:flex-start;
    justify-content:center;
    padding:28px 16px 56px;
  }
  .card{
    background:#fff;
    border-radius:20px;
    width:100%;
    max-width:420px;
    overflow:hidden;
    box-shadow:0 4px 24px rgba(0,0,0,.08),0 1px 4px rgba(0,0,0,.04);
  }

  /* ── Header ── */
  .card-head{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:16px 18px 14px;
  }
  .rest-name{font-size:16px;font-weight:800;color:#0f172a;letter-spacing:-0.02em}
  .tax-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#94a3b8}

  /* ── Paid banner ── */
  .paid-banner{
    display:flex;align-items:center;gap:7px;
    padding:8px 18px;
    background:linear-gradient(90deg,#16a34a,#15803d);
    color:#fff;font-size:12px;font-weight:700;letter-spacing:.03em;
  }
  .paid-method{
    margin-left:auto;background:rgba(255,255,255,.22);
    border-radius:999px;padding:2px 10px;font-size:10px;font-weight:700;
  }

  /* ── Dividers ── */
  .div-d{border:none;border-top:1px dashed #e2e8f0;margin:0 18px}
  .div-s{border:none;border-top:2px dashed #cbd5e1;margin:0 18px}

  /* ── Meta bar ── */
  .meta{
    display:flex;align-items:center;gap:5px;flex-wrap:wrap;
    padding:9px 18px;font-size:11px;color:#94a3b8;
  }
  .dot{color:#e2e8f0}

  /* ── Items ── */
  .items{padding:14px 18px;display:flex;flex-direction:column;gap:10px}
  .item{display:flex;align-items:flex-start;gap:8px}
  .item-left{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
  .item-name{font-size:13.5px;font-weight:600;color:#1e293b}
  .item-variant{font-size:10px;color:#94a3b8;font-style:italic}
  .item-qty{font-size:12px;color:#94a3b8;font-weight:600;white-space:nowrap;flex-shrink:0}
  .item-price{font-size:13.5px;font-weight:700;color:#1e293b;white-space:nowrap;flex-shrink:0;min-width:52px;text-align:right}

  /* ── Subtotals ── */
  .subtotals{padding:10px 18px;display:flex;flex-direction:column;gap:5px}
  .sub-row{display:flex;justify-content:space-between;font-size:12.5px;color:#64748b}
  .ask-staff{font-size:11px;color:#94a3b8;font-style:italic}

  /* ── Total ── */
  .total-row{
    display:flex;justify-content:space-between;align-items:center;
    padding:13px 18px 15px;
    font-size:17px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;
  }
  .total-amount{color:#16a34a}

  /* ── QR block ── */
  .qr-block{
    display:flex;flex-direction:column;align-items:center;gap:10px;
    padding:20px 18px 24px;
    background:#f8fafc;
    border-top:1px dashed #e2e8f0;
  }
  .qr-frame{
    padding:10px;background:#fff;
    border:2px solid #e2e8f0;border-radius:14px;
    line-height:0;box-shadow:0 2px 8px rgba(0,0,0,.06);
  }
  .qr-caption{font-size:11px;color:#64748b;text-align:center;line-height:1.45;max-width:200px}
  .qr-upi{
    font-size:13px;font-weight:700;color:#0f172a;
    background:#e0f2fe;border-radius:999px;padding:4px 16px;
  }

  /* ── Footer ── */
  .footer{text-align:center;padding:12px 20px 16px;font-size:10px;color:#94a3b8;line-height:1.7}
</style>
</head>
<body>
<div class="card">

  <div class="card-head">
    <span class="rest-name">${restaurantName || "Restaurant"}</span>
    <span class="tax-label">Tax Invoice</span>
  </div>

  ${isPaid ? `<div class="paid-banner">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    Payment Received
    <span class="paid-method">${methodLabel}</span>
  </div>` : ""}

  <hr class="div-d"/>

  <div class="meta">
    <span>${dateStr}</span>
    <span class="dot">·</span>
    <span>${timeStr}</span>
    ${tableLabel ? `<span class="dot">·</span><span>Table: <strong>${tableLabel}</strong></span>` : ""}
  </div>

  <hr class="div-d"/>

  <div class="items">${itemRows}</div>

  <hr class="div-d"/>

  <div class="subtotals">
    <div class="sub-row"><span>Subtotal</span><span>₹${total.toFixed(0)}</span></div>
    <div class="sub-row"><span>Taxes &amp; charges</span><span class="ask-staff">Ask staff</span></div>
  </div>

  <hr class="div-s"/>

  <div class="total-row">
    <span>TOTAL</span>
    <span class="total-amount">₹${total.toFixed(0)}</span>
  </div>

  ${qrDataUrl && upiId ? `<div class="qr-block">
    <div class="qr-frame"><img src="${qrDataUrl}" width="160" height="160" alt="UPI QR"/></div>
    <p class="qr-caption">Scan with Google Pay, PhonePe, Paytm<br/>or any UPI app</p>
    <p class="qr-upi">${upiId}</p>
  </div>` : ""}

  <p class="footer">Thank you for dining with us!<br/>Taxes will be added as per actuals &nbsp;·&nbsp; Powered by QR Menu</p>

</div>
</body>
</html>`;
}
