import { useState, useRef, useEffect } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { db, isFirebaseConfigured } from "../firebase.js";
import { downloadInvoice } from "../utils/invoice.js";
import { Check, Download, Mail, RotateCcw, Search, Trash2, X } from "lucide-react";

function timeAgo(date) {
  if (!date) return "";
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fmtTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Invoice Modal ──
function InvoiceModal({ order, restaurantName, upiId, onClose }) {
  const qrCanvasRef = useRef(null);

  const shortId = order.id?.slice(-6).toUpperCase();
  const entries = (order.items || []).map((item) => ({
    item: {
      id: item.id || item.name,
      name: item.name,
      price: item.price,
      variant: item.variant || null,
    },
    qty: item.qty,
  }));
  const total =
    order.total ||
    entries.reduce((s, { item, qty }) => s + item.price * qty, 0);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const upiLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(restaurantName || "Restaurant")}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order #${shortId}`)}`
    : null;

  const isPaid = order.paymentStatus === "paid";

  const getQrDataUrl = () =>
    qrCanvasRef.current?.querySelector("canvas")?.toDataURL() || null;

  const handleDownload = () => {
    downloadInvoice({
      restaurantName,
      orderNum: shortId,
      entries,
      total,
      tableLabel: order.tableLabel || "",
      itemNotes: {},
      upiId,
      qrDataUrl: getQrDataUrl(),
    });
  };

  const buildInvoiceText = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    const itemLines = (order.items || [])
      .map((item) => `• ${item.name} ×${item.qty} — ₹${(item.price * item.qty).toFixed(0)}`)
      .join("\n");

    const lines = [
      `*Invoice #${shortId}*`,
      restaurantName || "Restaurant",
      order.tableLabel ? `Table: ${order.tableLabel}` : null,
      `${dateStr} · ${timeStr}`,
      "",
      `*Order Items:*`,
      itemLines,
      "",
      `─────────────────`,
      `*Total: ₹${total.toFixed(0)}*`,
    ];

    if (upiId) lines.push("", `UPI ID: ${upiId}`);
    lines.push("", "Thank you for dining with us! 🍽");

    return lines.filter((l) => l !== null).join("\n");
  };

  const handleShareWhatsApp = () => {
    const text = buildInvoiceText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Invoice #${shortId} — ${restaurantName || "Restaurant"}`);
    const body = encodeURIComponent(buildInvoiceText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="inv-modal-overlay" onClick={onClose}>
      <div className="inv-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Invoice #${shortId}`}>

        {/* ── Modal header ── */}
        <div className="inv-modal__header">
          <div className="inv-modal__header-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h3 className="inv-modal__title">Invoice #{shortId}</h3>
          </div>
          <button className="inv-modal__close" onClick={onClose} aria-label="Close">
             <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="inv-modal__body">

          {/* Payment Done banner inside modal */}
          {isPaid && (
            <div className="inv-modal__paid-banner">
               <Check size={18} />
              Payment Received ·{" "}
              {order.paymentMethod === "upi" ? "UPI" : "Cash"}
            </div>
          )}

          {/* ── Receipt card ── */}
          <div className="inv-modal__receipt">

            <div className="inv-modal__receipt-top">
              <p className="inv-modal__rest-name">{restaurantName || "Restaurant"}</p>
              <p className="inv-modal__tax-label">TAX INVOICE</p>
            </div>

            <div className="inv-modal__meta">
              <span>{dateStr}</span>
              <span className="inv-modal__meta-dot">·</span>
              <span>{timeStr}</span>
              {order.tableLabel && (
                <>
                  <span className="inv-modal__meta-dot">·</span>
                  <span>Table: <strong>{order.tableLabel}</strong></span>
                </>
              )}
            </div>

            <div className="inv-modal__divider inv-modal__divider--dashed" />

            <div className="inv-modal__items">
              {(order.items || []).map((item, i) => (
                <div key={i} className="inv-modal__item">
                  <div className="inv-modal__item-left">
                    <span className="inv-modal__item-name">{item.name}</span>
                    {item.variant && (
                      <span className="inv-modal__item-variant">{item.variant.label || item.variant}</span>
                    )}
                  </div>
                  <span className="inv-modal__item-qty">×{item.qty}</span>
                  <span className="inv-modal__item-price">
                    ₹{(item.price * item.qty).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="inv-modal__divider inv-modal__divider--dashed" />

            <div className="inv-modal__subtotals">
              <div className="inv-modal__sub-row">
                <span>Subtotal</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
              <div className="inv-modal__sub-row">
                <span>Taxes &amp; charges</span>
                <span className="inv-modal__ask-staff">Ask staff</span>
              </div>
            </div>

            <div className="inv-modal__divider inv-modal__divider--solid" />

            <div className="inv-modal__total-row">
              <span>TOTAL</span>
              <span>₹{total.toFixed(0)}</span>
            </div>

            {/* ── UPI Payment QR ── */}
            {upiLink && (
              <div className="inv-modal__qr-block">
                <div className="inv-modal__qr-frame">
                  <QRCodeSVG
                    value={upiLink}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="M"
                    marginSize={2}
                  />
                </div>
                <p className="inv-modal__qr-caption">
                  Scan with Google Pay, PhonePe, Paytm or any UPI app
                </p>
                <p className="inv-modal__qr-upi-id">{upiId}</p>

                {/* Hidden canvas — for embedding QR in downloaded PDF */}
                <div
                  ref={qrCanvasRef}
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    top: 0,
                    visibility: "hidden",
                  }}
                >
                  <QRCodeCanvas value={upiLink} size={200} level="M" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Action bar ── */}
        <div className="inv-modal__actions">
          <button className="inv-modal__action-btn inv-modal__action-btn--download" onClick={handleDownload}>
            <Download size={14} />
            Download
          </button>

          <button
            className="inv-modal__action-btn inv-modal__action-btn--wa"
            onClick={handleShareWhatsApp}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.827L0 24l6.336-1.5A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.6 9.6 0 01-4.9-1.343l-.35-.208-3.762.89.936-3.663-.228-.374A9.56 9.56 0 012.4 12C2.4 6.698 6.698 2.4 12 2.4S21.6 6.698 21.6 12 17.302 21.6 12 21.6z" />
            </svg>
            WhatsApp
          </button>

          <button
            className="inv-modal__action-btn inv-modal__action-btn--email"
            onClick={handleShareEmail}
          >
            <Mail size={14} />
            Email
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Orders Tab ──
export default function OrdersTab({
  orders,
  onSelectOrder,
  onReleaseTable,
  onDeleteOrder,
  restaurantName,
  upiId,
  highlightOrderId,
  onHighlightClear,
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  useEffect(() => {
    if (!highlightOrderId) return;
    setFilter("all");
    setSearch("");
    const scrollTimer = setTimeout(() => {
      const el = document.querySelector(`[data-order-id="${highlightOrderId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    const clearTimer = setTimeout(() => onHighlightClear?.(), 3000);
    return () => { clearTimeout(scrollTimer); clearTimeout(clearTimer); };
  }, [highlightOrderId]);

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => (o.status || "pending") === "pending").length,
    done: orders.filter((o) => o.status === "done").length,
    table: orders.filter((o) => !!o.tableLabel).length,
    paid: orders.filter((o) => o.paymentStatus === "paid").length,
  };

  const visible = orders.filter((o) => {
    if (filter === "table" && !o.tableLabel) return false;
    if (filter === "paid" && o.paymentStatus !== "paid") return false;
    if (
      filter !== "all" &&
      filter !== "table" &&
      filter !== "paid" &&
      (o.status || "pending") !== filter
    )
      return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase().replace(/^#/, "");
      return (
        o.id?.slice(-6).toLowerCase().includes(q) ||
        (o.tableLabel || "").toLowerCase().includes(q) ||
        (o.mobile || "").includes(q)
      );
    }
    return true;
  });

  const handleStatusToggle = async (e, order, currentDisplayStatus) => {
    e.stopPropagation();
    if (!isFirebaseConfigured) return;
    const next = currentDisplayStatus === "pending" ? "done" : "pending";
    try {
      await updateDoc(doc(db, "orders", order.id), { status: next });
      if (next === "done" && order.tableId) {
        onReleaseTable?.(order.tableId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="ord-tab">
      {/* ── Section header ── */}
      <header className="ord-tab__header">
        <div className="ord-tab__header-left">
          <h2 className="ord-tab__title">Orders</h2>
          <p className="ord-tab__sub">
            {counts.all} total &nbsp;·&nbsp; {counts.pending} pending
          </p>
        </div>
        <div className="ord-tab__stats">
          <div className="ord-tab__stat ord-tab__stat--pending">
            <span className="ord-tab__stat-val">{counts.pending}</span>
            <span className="ord-tab__stat-label">Pending</span>
          </div>
          <div className="ord-tab__stat ord-tab__stat--done">
            <span className="ord-tab__stat-val">{counts.done}</span>
            <span className="ord-tab__stat-label">Done</span>
          </div>
        </div>
      </header>

      {/* ── Toolbar: filter nav + search ── */}
      <div className="ord-tab__toolbar">
        <nav className="ord-tab__filters" aria-label="Order filters">
          {[
            ["all", "All"],
            ["pending", "Pending"],
            ["done", "Done"],
            ["paid", "Paid"],
            ["table", "Table Orders"],
          ].map(([val, label]) => (
            <button
              key={val}
              className={`ord-tab__filter-btn ${filter === val ? "active" : ""}`}
              onClick={() => setFilter(val)}
              aria-pressed={filter === val}
            >
              {label}&nbsp;
              <span aria-label={`${counts[val]} orders`}>
               ({counts[val]})
              </span>
            </button>
          ))}
        </nav>

        <div role="search" className="ord-tab__search">
          <Search size={16} />
          <input
            className="ord-tab__search-input"
            placeholder="Search by order #…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search orders"
          />
          {search && (
            <button
              className="ord-tab__search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Empty state or cards grid ── */}
      {visible.length === 0 ? (
        <div className="ord-tab__empty" role="status">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <p>No {filter === "all" ? "" : filter} orders yet</p>
        </div>
      ) : (
        <section className="ord-tab__grid" aria-label="Orders list">
          {visible.map((order) => {
            const status = order.status || "pending";
            const ts = order.timestamp?.toDate
              ? order.timestamp.toDate()
              : order.timestamp
                ? new Date(order.timestamp)
                : null;
            const total =
              order.total ||
              order.items?.reduce((s, i) => s + i.price * i.qty, 0) ||
              0;
            const itemCount = order.items?.reduce((s, i) => s + i.qty, 0) || 0;
            const shortId = order.id?.slice(-6).toUpperCase();
            const isPaid = order.paymentStatus === "paid";
            const displayStatus = isPaid ? "done" : status;

            return (
              <article
                key={order.id}
                data-order-id={order.id}
                className={`ord-card ord-card--${displayStatus} ${order.tableLabel ? "ord-card--table" : ""} ${isPaid ? "ord-card--paid" : ""} ${highlightOrderId === order.id ? "ord-card--highlight" : ""}`}
                onClick={() => onSelectOrder(order)}
              >
                {/* Card header */}
                <header className="ord-card__head">
                  <div className="ord-card__icon" aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                  </div>
                  <div className="ord-card__head-info">
                    <strong className="ord-card__id">Order #{shortId}</strong>
                    <div className="ord-card__time-row">
                      {ts && (
                        <time
                          className="ord-card__time-abs"
                          dateTime={ts.toISOString()}
                        >
                          {fmtTime(ts)}
                        </time>
                      )}
                      <time
                        className="ord-card__time"
                        dateTime={ts?.toISOString()}
                      >
                        {ts ? timeAgo(ts) : "—"}
                      </time>
                    </div>
                  </div>
                  <span
                    className={`ord-card__badge ord-card__badge--${displayStatus}`}
                    role="status"
                  >
                    {displayStatus === "pending" ? (
                      <>
                        <span className="ord-card__pulse" aria-hidden="true" />
                        Pending
                      </>
                    ) : (
                      <>
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Done
                      </>
                    )}
                  </span>
                </header>

                {/* Payment banner */}
                {isPaid && (
                  <div className="ord-card__pay-banner" aria-label="Payment received">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Payment Done
                    <span className="ord-card__pay-method-tag">
                      {order.paymentMethod === "upi" ? "UPI" : "Cash"}
                    </span>
                  </div>
                )}

                {/* Source chip + mobile */}
                <div className="ord-card__source">
                  {order.tableLabel ? (
                    <span className="ord-card__source-chip ord-card__source-chip--table">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="6" width="18" height="3" rx="1" />
                        <line x1="7" y1="9" x2="7" y2="18" />
                        <line x1="17" y1="9" x2="17" y2="18" />
                        <line x1="5" y1="18" x2="9" y2="18" />
                        <line x1="15" y1="18" x2="19" y2="18" />
                      </svg>
                      {order.tableLabel}
                    </span>
                  ) : (
                    <span className="ord-card__source-chip ord-card__source-chip--qr">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="17" y="17" width="4" height="4" rx="0.5" />
                      </svg>
                      Menu QR
                    </span>
                  )}
                  {order.mobile && (
                    <span className="ord-card__source-chip ord-card__source-chip--mobile">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18"/>
                      </svg>
                      +91 {order.mobile}
                    </span>
                  )}
                </div>

                {/* Items */}
                <ul className="ord-card__items">
                  {(order.items || []).slice(0, 3).map((item, i) => (
                    <li key={i} className="ord-card__item">
                      <span className="ord-card__item-dot" aria-hidden="true" />
                      <span className="ord-card__item-name">{item.name}</span>
                      <span className="ord-card__item-qty">×{item.qty}</span>
                      <span className="ord-card__item-price">
                        ₹{(item.price * item.qty).toFixed(0)}
                      </span>
                    </li>
                  ))}
                  {(order.items?.length || 0) > 3 && (
                    <li className="ord-card__item ord-card__item--more">
                      +{order.items.length - 3} more item
                      {order.items.length - 3 !== 1 ? "s" : ""}
                    </li>
                  )}
                </ul>

                {/* Card footer */}
                <footer className="ord-card__footer">
                  <div className="ord-card__total-block">
                    <small className="ord-card__total-label">
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </small>
                    <strong className="ord-card__total">
                      ₹{total.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  {/* Invoice modal trigger */}
                  <button
                    className="ord-card__invoice-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInvoiceOrder(order);
                    }}
                    aria-label="View invoice"
                    title="View / Download Invoice"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </button>

                  <button
                    className="ord-card__delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOrder(order.id);
                    }}
                    aria-label="Delete order"
                  >
                    <Trash2 size={18} />
                  </button>

                  <button
                    className={`ord-card__action ord-card__action--${displayStatus}`}
                    onClick={(e) => handleStatusToggle(e, order, displayStatus)}
                  >
                    {displayStatus === "pending" ? (
                      <>
                        <Check size={18} />
                        Mark Done
                      </>
                    ) : (
                      <>
                         <RotateCcw size={18} />
                        Reopen
                      </>
                    )}
                  </button>
                </footer>
              </article>
            );
          })}
        </section>
      )}

      {/* ── Invoice Modal ── */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          restaurantName={restaurantName}
          upiId={upiId}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </section>
  );
}
