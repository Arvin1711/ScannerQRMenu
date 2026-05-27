import { useState, useRef } from "react";
import { updateDoc, getDoc, doc } from "firebase/firestore";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { IcoWhatsApp } from "../icons.jsx";
import { db, isFirebaseConfigured, menuDoc } from "../firebase.js";
import { downloadInvoice } from "../utils/invoice.js";
import { BadgeIndianRupee, Check, CreditCard, Download, QrCode } from "lucide-react";

const WaIcon = () => <IcoWhatsApp size={18} />;

export default function InvoiceSummary({
  restaurantName,
  orderNum,
  entries,
  total,
  tableLabel,
  tableId,
  itemNotes,
  waLink,
  onBack,
  onReorder,
  upiId,
  orderDocId,
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

  const qrRef = useRef(null);

  // payStep: null | "choose" | "cash" | "upi"
  const [payStep, setPayStep] = useState(null);
  const [payDone, setPayDone] = useState(false);
  const [payMethod, setPayMethod] = useState(null);
  const [paying, setPaying] = useState(false);

  const upiLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(restaurantName || "Restaurant")}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order #${orderNum}`)}`
    : null;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    const qrDataUrl = canvas?.toDataURL() || null;
    downloadInvoice({
      restaurantName,
      orderNum,
      entries,
      total,
      tableLabel,
      itemNotes,
      upiId,
      qrDataUrl,
    });
  };

  const confirmPayment = async (method) => {
    setPaying(true);
    try {
      if (isFirebaseConfigured && orderDocId) {
        await updateDoc(doc(db, "orders", orderDocId), {
          paymentStatus: "paid",
          paymentMethod: method,
          paidAt: new Date(),
        });
      }
      if (isFirebaseConfigured && menuDoc && tableId) {
        const snap = await getDoc(menuDoc);
        if (snap.exists()) {
          const updated = (snap.data().tables || []).map((t) =>
            String(t.id) === String(tableId) ? { ...t, booked: false } : t
          );
          await updateDoc(menuDoc, { tables: updated });
        }
      }
      setPayMethod(method);
      setPayDone(true);
      setPayStep(null);
    } catch (_) {
      setPayMethod(method);
      setPayDone(true);
      setPayStep(null);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="op-receipt">
      <div className="op-receipt__ring">
        <Check size={20} />
      </div>

      <h2 className="op-receipt__title">Order Confirmed!</h2>

      <div className="op-receipt__meta-row">
        <span className="op-receipt__badge">#{orderNum}</span>
        {tableLabel && (
          <span className="op-receipt__badge op-receipt__badge--table">
            🪑 {tableLabel}
          </span>
        )}
        {payDone && (
          <span className="op-receipt__badge op-receipt__badge--paid">
             <Check size={18} />
            Paid · {payMethod === "upi" ? "UPI" : "Cash"}
          </span>
        )}
      </div>

      <div className="op-invoice">
        <div className="op-invoice__header">
          <p className="op-invoice__restaurant">
            {restaurantName || "Your Order"}
          </p>
          <p className="op-invoice__label">TAX INVOICE</p>
        </div>

        <div className="op-invoice__date">
          {dateStr} &nbsp;·&nbsp; {timeStr}
        </div>

        <div className="op-invoice__divider op-invoice__divider--dashed" />

        <div className="op-invoice__items">
          {entries.map(({ item, qty }) => (
            <div key={item.id} className="op-invoice__item">
              <div className="op-invoice__item-left">
                <span className="op-invoice__item-name">{item.name}</span>
                {item.variant && (
                  <span className="op-invoice__item-variant">
                    {item.variant.label}
                  </span>
                )}
                {itemNotes?.[item.id] && (
                  <span className="op-invoice__item-note">
                    📝 {itemNotes[item.id]}
                  </span>
                )}
              </div>
              <span className="op-invoice__item-qty">×{qty}</span>
              <span className="op-invoice__item-price">
                ₹{(item.price * qty).toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        <div className="op-invoice__divider op-invoice__divider--dashed" />

        <div className="op-invoice__subtotals">
          <div className="op-invoice__sub-row">
            <span>Subtotal</span>
            <span>₹{total.toFixed(0)}</span>
          </div>
          <div className="op-invoice__sub-row">
            <span>Taxes &amp; charges</span>
            <span className="op-invoice__ask-staff">Ask staff</span>
          </div>
        </div>

        <div className="op-invoice__divider op-invoice__divider--solid" />

        <div className="op-invoice__total">
          <span>Total</span>
          <span>₹{total.toFixed(0)}</span>
        </div>
      </div>

      <button className="op-download-btn" onClick={handleDownload}>
        <Download size={20} />
        Download Invoice
      </button>

      {waLink && (
        <a
          className="op-wa-btn"
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WaIcon />
          Notify via WhatsApp
        </a>
      )}

      <div className="op-receipt__footer-btns">
        <button className="op-back-btn" onClick={onBack}>
          Back to Menu
        </button>
        {onReorder && (
          <button className="op-reorder-btn" onClick={onReorder}>
            Reorder
          </button>
        )}

        {/* ── Payment button / done state ── */}
        {payDone ? (
          <div className="op-pay-done">
            <Check size={16} />
            Payment confirmed · {payMethod === "upi" ? "UPI" : "Cash"}
          </div>
        ) : (
          <button className="op-pay-btn" onClick={() => setPayStep("choose")}>
            <CreditCard size={18} />
            Pay Now
          </button>
        )}
      </div>

      {/* Hidden canvas — used only to generate QR data URL for invoice download */}
      {upiLink && (
        <div ref={qrRef} style={{ position: "absolute", left: "-9999px", top: 0, visibility: "hidden" }}>
          <QRCodeCanvas value={upiLink} size={200} level="M" />
        </div>
      )}

      {/* ── Payment modal ── */}
      {payStep && (
        <div
          className="op-pay-overlay"
          onClick={() => !paying && setPayStep(null)}
        >
          <div className="op-pay-modal" onClick={(e) => e.stopPropagation()}>
            {payStep === "choose" && (
              <>
                <div className="op-pay-modal__header">
                  <h3 className="op-pay-modal__title">Choose Payment</h3>
                  <p className="op-pay-modal__amount">₹{total.toFixed(0)}</p>
                </div>
                <div className="op-pay-modal__methods">
                  <button
                    className="op-pay-method op-pay-method--cash"
                    onClick={() => setPayStep("cash")}
                  >
                    <div className="op-pay-method__icon">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <circle cx="12" cy="12" r="3" />
                        <path d="M1 10h4M19 10h4M1 14h4M19 14h4" />
                      </svg>
                    </div>
                    <span className="op-pay-method__label">Cash</span>
                    <span className="op-pay-method__sub">Pay at counter</span>
                  </button>

                  <button
                    className={`op-pay-method op-pay-method--upi${!upiId ? " op-pay-method--disabled" : ""}`}
                    onClick={() => upiId && setPayStep("upi")}
                    disabled={!upiId}
                  >
                    <div className="op-pay-method__icon">
                      <QrCode size={28} />
                    </div>
                    <span className="op-pay-method__label">UPI</span>
                    <span className="op-pay-method__sub">
                      {upiId ? "Scan &amp; pay" : "Not configured"}
                    </span>
                  </button>
                </div>
                <button
                  className="op-pay-modal__cancel"
                  onClick={() => setPayStep(null)}
                >
                  Cancel
                </button>
              </>
            )}

            {payStep === "cash" && (
              <>
                <div className="op-pay-modal__header">
                  <div className="op-pay-modal__method-icon op-pay-modal__method-icon--cash">
                    <BadgeIndianRupee size={28} />
                  </div>
                  <h3 className="op-pay-modal__title">Cash Payment</h3>
                  <p className="op-pay-modal__amount">₹{total.toFixed(0)}</p>
                  <p className="op-pay-modal__hint">
                    Please hand over cash to the staff at the counter.
                  </p>
                </div>
                <div className="op-pay-modal__actions">
                  <button
                    className="op-pay-modal__back-btn"
                    onClick={() => setPayStep("choose")}
                  >
                    Back
                  </button>
                  <button
                    className="op-pay-modal__confirm"
                    onClick={() => confirmPayment("cash")}
                    disabled={paying}
                  >
                    {paying ? "Confirming…" : "Confirm Cash Payment"}
                  </button>
                </div>
              </>
            )}

            {payStep === "upi" && upiId && (
              <>
                <div className="op-pay-modal__header">
                  <h3 className="op-pay-modal__title">Scan &amp; Pay</h3>
                  <p className="op-pay-modal__amount">₹{total.toFixed(0)}</p>
                </div>

                <div className="op-pay-qr-block">
                  <QRCodeSVG
                    value={upiLink}
                    size={190}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="M"
                    marginSize={2}
                  />
                  <p className="op-pay-qr-block__label">
                    Scan with Google Pay, PhonePe, Paytm or any UPI app
                  </p>
                  <p className="op-pay-qr-block__upi-id">{upiId}</p>
                </div>

                <div className="op-pay-qr-or">
                  <span />
                  <span>or</span>
                  <span />
                </div>

                <a className="op-pay-upi-box__open op-pay-upi-box__open--full" href={upiLink}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open UPI App
                </a>

                <p className="op-pay-upi-hint">
                  After completing payment, tap the button below.
                </p>

                <div className="op-pay-modal__actions">
                  <button
                    className="op-pay-modal__back-btn"
                    onClick={() => setPayStep("choose")}
                  >
                    Back
                  </button>
                  <button
                    className="op-pay-modal__confirm"
                    onClick={() => confirmPayment("upi")}
                    disabled={paying}
                  >
                    {paying ? "Confirming…" : "I've Paid"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
