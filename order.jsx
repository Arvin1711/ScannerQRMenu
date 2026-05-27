import { useState } from "react";
import { IcoWhatsApp, IcoBack, IcoBag } from "./src/icons.jsx";
import InvoiceSummary from "./src/components/InvoiceSummary.jsx";

const FALLBACK =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

const WaIcon   = () => <IcoWhatsApp size={18} />;
const BackIcon = () => <IcoBack />;
const BagIcon  = () => <IcoBag size={44} strokeWidth={1.4} />;


export default function OrderPage({
  cart,
  onUpdateQty,
  onClear,
  whatsapp,
  onBack,
  onOrderPlaced,
  itemNotes,
  onReorder,
  restaurantName,
  tableLabel,
  tableId,
  initialOrderNum,
  upiId,
  orderDocId,
}) {
  const [placed, setPlaced]       = useState(false);
  const [placing, setPlacing]     = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [orderNum]                = useState(() => initialOrderNum || Math.floor(1000 + Math.random() * 9000));
  const [lastEntries, setLastEntries] = useState([]);
  const [lastTotal, setLastTotal] = useState(0);

  const entries    = Object.values(cart);
  const total      = entries.reduce((s, { item, qty }) => s + item.price * qty, 0);
  const totalItems = entries.reduce((s, { qty }) => s + qty, 0);

  const waMsg = entries.length
    ? "Hi! I'd like to place an order:\n\n" +
      entries.map(({ item, qty }) => `• ${item.name} ×${qty} — ₹${(item.price * qty).toFixed(0)}`).join("\n") +
      `\n\nTotal: ₹${total.toFixed(0)}`
    : "";

  const waLink = whatsapp && entries.length
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(waMsg)}`
    : null;

  const waLinkPlaced = whatsapp && lastEntries.length
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        "Hi! I've just placed an order:\n\n" +
        lastEntries.map(({ item, qty }) => `• ${item.name} ×${qty} — ₹${(item.price * qty).toFixed(0)}`).join("\n") +
        `\n\nTotal: ₹${lastTotal.toFixed(0)}\nOrder #${orderNum}`
      )}`
    : null;

  const handlePlaceOrder = async () => {
    if (placing) return;
    // Keep the modal open — its button switches to "Placing…" so the user
    // has visible feedback instead of a cart flash they can't read.
    setPlacing(true);
    setLastEntries(entries);
    setLastTotal(total);
    await onOrderPlaced?.(entries, total, orderNum);
    setPlaced(true); // replaces the whole view (modal included)
  };

  // ── Single return keeps React reconciling the same div.op-page tree,
  //    eliminating the subtree-swap flash on transition to success. ──
  return (
    <div className="op-page">

      {placed ? (
        <InvoiceSummary
          restaurantName={restaurantName}
          orderNum={orderNum}
          entries={lastEntries}
          total={lastTotal}
          tableLabel={tableLabel}
          itemNotes={itemNotes}
          waLink={waLinkPlaced}
          onBack={() => { onClear(); onBack(); }}
          onReorder={onReorder ? () => { onReorder(lastEntries); onBack(); } : null}
          upiId={upiId}
          orderDocId={orderDocId}
          tableId={tableId}
        />
      ) : (
        <>
          {/* sticky header */}
          <div className="op-header">
            <button className="op-back-icon" onClick={onBack} title="Back">
              <BackIcon />
            </button>
            <div className="op-header-text">
              <h1 className="op-header-title">Your Order</h1>
              {totalItems > 0 && (
                <span className="op-header-count">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
              )}
            </div>
            {entries.length > 0 && (
              <button className="op-clear-btn" onClick={onClear}>Clear all</button>
            )}
          </div>

          {/* empty state */}
          {entries.length === 0 ? (
            <div className="op-empty">
              <div className="op-empty__icon"><BagIcon /></div>
              <p className="op-empty__title">Your order is empty</p>
              <p className="op-empty__sub">Tap any dish on the menu to add it here</p>
              <button className="op-empty__cta" onClick={onBack}>Browse Menu</button>
            </div>
          ) : (
            <>
              {/* item cards */}
              <div className="op-items">
                {entries.map(({ item, qty }) => (
                  <div key={item.id} className="op-item">
                    <div className="op-item__img">
                      <img src={item.image || FALLBACK} alt={item.name} />
                    </div>

                    <div className="op-item__body">
                      <p className="op-item__cat">{item.category}</p>
                      <p className="op-item__name">{item.name}</p>
                      {item.variant && <p className="op-item__variant">{item.variant.label}</p>}
                      {itemNotes?.[item.id] && (
                        <p className="op-item__note">📝 {itemNotes[item.id]}</p>
                      )}

                      <div className="op-item__foot">
                        <div className="op-stepper">
                          <button
                            className={`op-stepper__btn ${qty === 1 ? "op-stepper__btn--remove" : ""}`}
                            onClick={() => onUpdateQty(item.id, qty - 1)}
                          >
                            {qty === 1 ? (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                              </svg>
                            ) : "−"}
                          </button>
                          <span className="op-stepper__count">{qty}</span>
                          <button className="op-stepper__btn op-stepper__btn--add" onClick={() => onUpdateQty(item.id, qty + 1)}>+</button>
                        </div>
                      </div>
                    </div>

                    <div className="op-item__price-col">
                      <p className="op-item__subtotal">₹{(item.price * qty).toFixed(0)}</p>
                      <p className="op-item__unit">₹{item.price.toFixed(0)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* bill summary */}
              <div className="op-bill">
                <p className="op-bill__heading">Bill Summary</p>
                <div className="op-bill__rows">
                  {entries.map(({ item, qty }) => (
                    <div key={item.id} className="op-bill__row op-bill__row--item">
                      <span>{item.name} ×{qty}</span>
                      <span>₹{(item.price * qty).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="op-bill__divider" />
                <div className="op-bill__row">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
                <div className="op-bill__row">
                  <span>Taxes &amp; charges</span>
                  <span className="op-bill__note">Ask staff</span>
                </div>
                <div className="op-bill__divider op-bill__divider--thick" />
                <div className="op-bill__row op-bill__row--total">
                  <span>Total</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
              </div>
            </>
          )}

          {/* sticky bottom bar */}
          {entries.length > 0 && (
            <div className="op-bottom">
              <button className="op-add-btn" onClick={onBack}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add items
              </button>
              <button
                className={`op-place-btn${placing ? " op-place-btn--loading" : ""}`}
                onClick={() => setConfirming(true)}
                disabled={placing}
              >
                {placing ? (
                  <span className="op-place-btn__spinner" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                )}
                <span>{placing ? "Placing…" : `Place Order · ₹${total.toFixed(0)}`}</span>
              </button>
            </div>
          )}

          {waLink && entries.length > 0 && (
            <div className="op-wa-row">
              <a className="op-wa-alt" href={waLink} target="_blank" rel="noopener noreferrer">
                <WaIcon /> Order via WhatsApp instead
              </a>
            </div>
          )}

          {/* confirm modal — stays open during placing so user sees the spinner */}
          {confirming && (
            <div className="op-overlay" onClick={() => !placing && setConfirming(false)}>
              <div className="op-modal" onClick={(e) => e.stopPropagation()}>
                <div className="op-modal__icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                </div>
                <h2 className="op-modal__title">Place your order?</h2>
                <p className="op-modal__sub">{totalItems} item{totalItems !== 1 ? "s" : ""} · ₹{total.toFixed(0)}</p>
                <div className="op-modal__list">
                  {entries.map(({ item, qty }) => (
                    <div key={item.id} className="op-modal__row">
                      <span>{item.name} <span className="op-modal__qty">×{qty}</span></span>
                      <span>₹{(item.price * qty).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="op-modal__total">
                    <span>Total</span>
                    <span>₹{total.toFixed(0)}</span>
                  </div>
                </div>
                <div className="op-modal__actions">
                  <button className="op-modal__cancel" onClick={() => setConfirming(false)} disabled={placing}>Cancel</button>
                  <button className="op-modal__confirm" onClick={handlePlaceOrder} disabled={placing}>
                    {placing ? (
                      <><span className="op-place-btn__spinner" /> Placing…</>
                    ) : "Confirm Order"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
