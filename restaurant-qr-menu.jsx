import { useState, useEffect, useMemo, useRef } from "react";
import { onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { menuDoc, isFirebaseConfigured, ordersCol, reviewsCol, auth, db } from "./src/firebase.js";
import AuthPage from "./src/auth/AuthPage.jsx";
import { LOCAL_KEY } from "./src/auth/Login.jsx";
import AdminPanel, {
  STORAGE_KEY,
  DEFAULT_DATA,
  browserStorage,
  normalizeData,
} from "./admin.jsx";
import OrderPage from "./order.jsx";
import HomePage from "./src/landingpage/HomePage.jsx";

import { IcoGrid, IcoList, IcoWhatsApp, IcoGoogle } from "./src/icons.jsx";
import { Home, ClipboardList } from "lucide-react";
const GridIcon = () => <IcoGrid />;
const ListIcon = () => <IcoList />;
const WaIcon   = () => <IcoWhatsApp size={18} />;

const TAG_LABELS = { new: "New", popular: "⭐ Popular", chef: "👨‍🍳 Chef's" };

const SPICE_NAMES = ["", "Mild", "Medium", "Hot"];
const FALLBACK =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

// ── Item detail bottom sheet ──
function ItemDetail({
  item,
  whatsapp,
  onClose,
  cart,
  onAddToCart,
  onUpdateQty,
  itemNotes,
  onSetItemNote,
}) {
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi! I'd like to order: ${item.name} — ₹${item.price}`)}`
    : null;
  const qty = cart[item.id]?.qty || 0;
  const [selectedVariant, setSelectedVariant] = useState(item.variants?.[0] || null);
  const [selectedAddons, setSelectedAddons] = useState([]);

  return (
    <div
      className="item-detail-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="item-detail-sheet">
        <button className="item-detail-close" onClick={onClose}>
          ✕
        </button>

        <div className="item-detail-image">
          <img src={item.image || FALLBACK} alt={item.name} />
          {item.tag && (
            <span className={`item-tag-badge tag-${item.tag}`}>
              {TAG_LABELS[item.tag]}
            </span>
          )}
          {!item.available && (
            <div className="sold-out-overlay">
              <span>Unavailable</span>
            </div>
          )}
        </div>

        <div className="item-detail-body">
          <div className="item-detail-meta">
            <span className="item-detail-cat">{item.category}</span>
            {item.veg != null && (
              <span
                className={`card-diet-badge ${item.veg ? "veg" : "nonveg"}`}
              >
                <span className="diet-dot-inner" />
              </span>
            )}
            {item.spice > 0 && (
              <span className="spice-indicator" title={SPICE_NAMES[item.spice]}>
                {"🌶️".repeat(item.spice)}
              </span>
            )}
          </div>

          <h2 className="item-detail-name">{item.name}</h2>
          {item.desc && <p className="item-detail-desc">{item.desc}</p>}

          {item.variants?.length > 0 && (
            <div className="item-variants">
              <p className="item-variants__label">Size</p>
              <div className="item-variants__options">
                {item.variants.map(v => (
                  <button
                    key={v.label}
                    className={`variant-btn ${selectedVariant?.label === v.label ? "active" : ""}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.label}{v.price > 0 ? ` +₹${v.price}` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.addons?.length > 0 && (
            <div className="item-addons">
              <p className="item-addons__label">Add-ons</p>
              {item.addons.map(a => (
                <label key={a.label} className="addon-row">
                  <input
                    type="checkbox"
                    checked={selectedAddons.some(x => x.label === a.label)}
                    onChange={e => setSelectedAddons(prev =>
                      e.target.checked ? [...prev, a] : prev.filter(x => x.label !== a.label)
                    )}
                  />
                  <span>{a.label}</span>
                  <span className="addon-price">+₹{a.price}</span>
                </label>
              ))}
            </div>
          )}

          <div className="item-detail-note-wrap">
            <label>Special Instructions</label>
            <textarea
              className="item-detail-note"
              placeholder="E.g. no onions, extra spicy…"
              value={itemNotes?.[item.id] || ""}
              onChange={(e) => onSetItemNote?.(item.id, e.target.value)}
              rows={2}
            />
          </div>

          <div className="item-detail-footer">
            <div>
              <p className="item-detail-price-label">Price</p>
              {item.discountPct > 0 ? (
                <div className="item-detail-price-offer-wrap">
                  <p className="item-detail-price-original">₹{(item.price + (selectedVariant?.price || 0) + selectedAddons.reduce((s, a) => s + a.price, 0)).toFixed(0)}</p>
                  <p className="item-detail-price">₹{((item.price * (1 - item.discountPct / 100)) + (selectedVariant?.price || 0) + selectedAddons.reduce((s, a) => s + a.price, 0)).toFixed(0)}</p>
                  <span className="menu-item-discount-badge">{item.discountPct}% OFF</span>
                </div>
              ) : (
                <p className="item-detail-price">₹{(item.price + (selectedVariant?.price || 0) + selectedAddons.reduce((s, a) => s + a.price, 0)).toFixed(0)}</p>
              )}
            </div>

            {item.available ? (
              <div className="item-detail-cta">
                {qty > 0 ? (
                  <div className="detail-qty-stepper">
                    <button onClick={() => onUpdateQty(item.id, qty - 1)}>
                      {qty === 1 ? "−" : "−"}
                    </button>
                    <span>{qty}</span>
                    <button onClick={() => onUpdateQty(item.id, qty + 1)}>
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    className="add-to-order-btn"
                    onClick={() => onAddToCart(item, selectedVariant, selectedAddons)}
                  >
                    + Add to Order
                  </button>
                )}
                {waLink && (
                  <a
                    className="wa-icon-btn"
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Order on WhatsApp"
                  >
                    <WaIcon />
                  </a>
                )}
              </div>
            ) : (
              <span className="menu-item-status unavailable">Sold Out</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const GoogleIcon = () => <IcoGoogle />;


// ── Welcome splash screen ──
function WelcomeScreen({ data, onEnterMenu }) {
  const [leaving, setLeaving] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({ food: 0, service: 0, atmosphere: 0 });
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [copied, setCopied] = useState(false);

  const handleMenu = () => {
    if (leaving) return;
    setLeaving("menu");
    setTimeout(onEnterMenu, 460);
  };

  const handleFeedback = () => {
    if (leaving) return;
    setShowFeedback(true);
  };

  const closeFeedback = () => {
    setShowFeedback(false);
    setRating(0);
    setHoverRating(0);
    setCategoryRatings({ food: 0, service: 0, atmosphere: 0 });
    setReviewText("");
    setReviewerName("");
  };

const handleSubmit = async () => {
    if (rating > 0 && isFirebaseConfigured && reviewsCol) {
      try {
        await addDoc(reviewsCol, {
          name: reviewerName.trim() || "Anonymous",
          rating,
          food: categoryRatings.food,
          service: categoryRatings.service,
          atmosphere: categoryRatings.atmosphere,
          text: reviewText.trim(),
          timestamp: serverTimestamp(),
          published: false,
        });
      } catch (_) {}
    }
    if (reviewText.trim() && navigator.clipboard) {
      navigator.clipboard.writeText(reviewText.trim()).catch(() => {});
    }
    if (data.googleReview) window.open(data.googleReview, "_blank", "noopener,noreferrer");
    closeFeedback();
  };


  const itemCount = data.items?.length ?? 0;
  const catCount = data.categories?.length ?? 0;

  return (
    <div className={`welcome-screen ${leaving ? `welcome-leaving-${leaving}` : ""}`}>
      {/* background */}
      <div className="welcome-bg">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
          alt=""
        />
        <div className="welcome-bg-overlay" />
      </div>

      {/* branding */}
      <div className="welcome-brand">
        <div className="welcome-avatar">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
            alt={data.name}
          />
        </div>
        <p className="welcome-greeting">Welcome to</p>
        <h1 className="welcome-name">
          {data.name.split(" ").length > 1 ? (
            <>
              {data.name.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="welcome-name-accent">
                {data.name.split(" ").at(-1)}
              </span>
            </>
          ) : (
            data.name
          )}
        </h1>
        <p className="welcome-tagline">{data.tagline}</p>
        <div className="welcome-chips">
          <span className="welcome-chip">🕐 Open Now</span>
          <span className="welcome-chip">✨ Fresh Daily</span>
          <span className="welcome-chip">⭐ Top Rated</span>
        </div>
      </div>

      {/* ── Stacked slide-up cards ── */}
      <div className="welcome-stack">

        {/* Feedback card — bottom layer, peeks behind menu card */}
        <div className="stack-card stack-feedback" onClick={handleFeedback}>
          <div className="stack-handle" />
          <div className="stack-row">
            <div className="stack-row-left">
              <span className="stack-icon">⭐</span>
              <div>
                <p className="stack-title">Leave Feedback</p>
                <p className="stack-sub">Share your experience on Google</p>
              </div>
            </div>
            <div className="stack-arrow-btn stack-arrow-btn--light">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Menu card — top layer */}
        <div className="stack-card stack-menu" onClick={handleMenu}>
          <div className="stack-handle" />
          <div className="stack-row">
            <div className="stack-row-left">
              <span className="stack-icon stack-icon--menu">🍽</span>
              <div>
                <p className="stack-title stack-title--dark">Explore Menu</p>
                <p className="stack-sub stack-sub--dark">{itemCount} dishes · {catCount} categories</p>
              </div>
            </div>
            <div className="stack-arrow-btn stack-arrow-btn--dark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
              </svg>
            </div>
          </div>
          <div className="stack-chips">
            {data.categories?.slice(0, 4).map((c) => (
              <span key={c} className="stack-chip-tag">{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Google Reviews slide-up sheet ── */}
      {showFeedback && (
        <div className="feedback-sheet-overlay" onClick={closeFeedback}>
          <div className="feedback-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="feedback-sheet-handle" />
            <button className="feedback-sheet-close" onClick={closeFeedback}>×</button>

            {/* Google header */}
            <div className="feedback-google-header">
              <div className="feedback-google-logo">
                <span style={{color:"#4285F4"}}>G</span>
                <span style={{color:"#EA4335"}}>o</span>
                <span style={{color:"#FBBC05"}}>o</span>
                <span style={{color:"#4285F4"}}>g</span>
                <span style={{color:"#34A853"}}>l</span>
                <span style={{color:"#EA4335"}}>e</span>
              </div>
              <p className="feedback-google-sub">Rate Your Experience</p>
            </div>

            {/* Overall star rating */}
            <div className="review-overall">
              <p className="review-overall-label">
                {rating === 0 ? "Tap to rate" : ["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
              </p>
              <div className="review-big-stars">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    className={`review-big-star ${(hoverRating || rating) >= s ? "lit" : ""}`}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                  >★</button>
                ))}
              </div>
            </div>

            {/* Category ratings */}
            <div className="review-categories">
              {[
                { key: "food",       label: "Food",        icon: "🍽️" },
                { key: "service",    label: "Service",     icon: "🤝" },
                { key: "atmosphere", label: "Atmosphere",  icon: "✨" },
              ].map(({ key, label, icon }) => (
                <div key={key} className="review-cat-row">
                  <span className="review-cat-label">{icon} {label}</span>
                  <div className="review-mini-stars">
                    {[1,2,3,4,5].map(s => (
                      <button
                        key={s}
                        className={`review-mini-star ${categoryRatings[key] >= s ? "lit" : ""}`}
                        onClick={() => setCategoryRatings(prev => ({ ...prev, [key]: s }))}
                      >★</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Name input */}
            <input
              className="review-name-input"
              type="text"
              placeholder="Your name (optional)"
              value={reviewerName}
              onChange={e => setReviewerName(e.target.value)}
            />

            {/* Write review */}
            <textarea
              className="review-textarea"
              placeholder="Share your experience…"
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={4}
            />

            {/* Submit */}
            <button
              className="feedback-cta-btn"
              onClick={handleSubmit}
              disabled={rating === 0}
            >
              {data.googleReview ? "Share on Google" : "Submit Review"}
            </button>
            {!data.googleReview && <p className="feedback-no-url">Ask staff for the Google review link.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Google review prompt ──
function GoogleReviewPrompt({ url, onClose }) {
  return (
    <div className="google-review-card">
      <button className="review-dismiss" onClick={onClose}>
        ×
      </button>
      <div className="review-header">
        <div className="review-g-icon">
          <GoogleIcon />
        </div>
        <div>
          <p className="review-title">Enjoying your meal?</p>
          <p className="review-sub">Share your experience</p>
        </div>
      </div>
      <div className="review-stars">★★★★★</div>
      <a
        className="review-btn"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Leave a Google Review
      </a>
    </div>
  );
}

// ── Hero Carousel ──
const CAROUSEL_OFFER_STYLES = [
  { badge: "Today's Special", accent: "#f97316" },
  { badge: "Chef's Pick",     accent: "#8b5cf6" },
  { badge: "Fan Favourite",   accent: "#e11d48" },
  { badge: "Must Try",        accent: "#059669" },
  { badge: "Fresh Today",     accent: "#0284c7" },
];

function MenuHeroCarousel({ data }) {
  const trackRef = useRef(null);

  const slides = useMemo(() => {
    const featured = data.items.filter(
      (i) => i.available && i.image && (i.tag === "popular" || i.tag === "chef" || i.tag === "new")
    );
    const pool = featured.length >= 2 ? featured : data.items.filter((i) => i.available && i.image);
    return pool.slice(0, 5);
  }, [data.items]);

  const [active, setActive] = useState(0);

  const scrollTo = (idx) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector(".menu-carousel__slide");
    if (!slide) return;
    const gap = 12;
    track.scrollTo({ left: idx * (slide.offsetWidth + gap), behavior: "smooth" });
  };

  const goTo = (idx) => {
    setActive(idx);
    scrollTo(idx);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setActive((p) => {
        const next = (p + 1) % slides.length;
        scrollTo(next);
        return next;
      });
    }, 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  // sync dot on native swipe scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const slide = track.querySelector(".menu-carousel__slide");
      if (!slide) return;
      const gap = 12;
      const idx = Math.round(track.scrollLeft / (slide.offsetWidth + gap));
      setActive(idx);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <div className="menu-carousel-wrap">
      <div className="menu-carousel" ref={trackRef}>
        {slides.map((item, i) => {
          const style = CAROUSEL_OFFER_STYLES[i % CAROUSEL_OFFER_STYLES.length];
          return (
            <div key={item.id} className="menu-carousel__slide">
              <img src={item.image} alt={item.name} className="menu-carousel__img" />
              <div className="menu-carousel__overlay">
                <span className="menu-carousel__badge" style={{ background: style.accent }}>
                  {style.badge}
                </span>
                <h3 className="menu-carousel__name">{item.name}</h3>
                {item.desc && <p className="menu-carousel__desc">{item.desc}</p>}
                {item.discountPct > 0 ? (
                  <p className="menu-carousel__price">
                    <span className="menu-carousel__price-original">₹{item.price.toFixed(0)}</span>
                    {" "}₹{(item.price * (1 - item.discountPct / 100)).toFixed(0)}
                    <span className="menu-carousel__discount-badge">{item.discountPct}% OFF</span>
                  </p>
                ) : (
                  <p className="menu-carousel__price">₹{item.price.toFixed(0)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <div className="menu-carousel__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`menu-carousel__dot${i === active ? " active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Customer Menu View ──
function MenuView({
  data,
  cart,
  onAddToCart,
  onUpdateQty,
  onViewOrder,
  onBackToWelcome,
  itemNotes,
  onSetItemNote,
  menuData,
  tableLabel,
  lastOrder,
}) {
  const [activeCat, setActiveCat] = useState("All");
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const cartCount = Object.values(cart).reduce((s, { qty }) => s + qty, 0);
  const cartTotal = Object.values(cart).reduce(
    (s, { item, qty }) => s + item.price * qty,
    0,
  );

  const baseItems = useMemo(() => {
    let items = [...data.items];
    if (dietFilter === "veg") items = items.filter((i) => i.veg === true);
    if (dietFilter === "nonveg") items = items.filter((i) => i.veg === false);
    return items;
  }, [data.items, dietFilter]);

  const visibleItems = useMemo(() => {
    let items =
      activeCat === "All"
        ? baseItems
        : baseItems.filter((i) => i.category === activeCat);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.desc && i.desc.toLowerCase().includes(q)),
      );
    }
    return items;
  }, [baseItems, activeCat, searchQuery]);

  const grouped = useMemo(
    () =>
      data.categories.reduce((acc, cat) => {
        const items = visibleItems.filter((i) => i.category === cat);
        if (items.length) acc[cat] = items;
        return acc;
      }, {}),
    [data.categories, visibleItems],
  );

  const fallbackImage =
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="menu-view">
      {/* ── Sticky Nav Header ── */}
      <div className="menu-nav-header">
        {onBackToWelcome ? (
          <button className="menu-nav-home" onClick={onBackToWelcome}>
            <Home size={16} />
            <span>Home</span>
          </button>
        ) : (
          <div className="menu-nav-home menu-nav-home--ghost" aria-hidden>
            <Home size={16} /><span>Home</span>
          </div>
        )}

        <div className="menu-nav-right-group">
          <p className="menu-nav-brand">{data.name}</p>
          {tableLabel ? (
            <div className="menu-nav-chip menu-nav-chip--table">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="18" height="3" rx="1"/><line x1="7" y1="9" x2="7" y2="18"/><line x1="17" y1="9" x2="17" y2="18"/><line x1="5" y1="18" x2="9" y2="18"/><line x1="15" y1="18" x2="19" y2="18"/>
              </svg>
              {tableLabel}
            </div>
          ) : lastOrder ? (
            <button className="menu-nav-chip menu-nav-chip--order" onClick={() => setShowOrderSummary(true)}>
              <ClipboardList size={12} />
              My Order
            </button>
          ) : null}
        </div>
      </div>

      {/* ── Hero Carousel ── */}
      <MenuHeroCarousel data={data} />

      <div className="menu-controls">
        <div className="category-chips">
          {["All", ...data.categories].map((cat) => {
            const count =
              cat === "All"
                ? visibleItems.length
                : visibleItems.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`category-btn ${activeCat === cat ? "active" : "inactive"}`}
              >
                {cat}
                {/* {count > 0 && <span className="cat-count">{count}</span>} */}
              </button>
            );
          })}
        </div>
      </div>

      <div className="menu-filter-bar">
        <div className="menu-search-wrap">
          <svg
            className="search-icon"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="6.5" cy="6.5" r="5" />
            <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" />
          </svg>
          <input
            className="menu-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes…"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="diet-switcher">
          <button
            className={`diet-opt ${dietFilter === "veg" ? "active-veg" : ""}`}
            onClick={() => setDietFilter(dietFilter === "veg" ? "all" : "veg")}
          >
            <span className="dot dot-veg" /> Veg
          </button>
          <div className="diet-divider" />
          <button
            className={`diet-opt ${dietFilter === "nonveg" ? "active-nonveg" : ""}`}
            onClick={() =>
              setDietFilter(dietFilter === "nonveg" ? "all" : "nonveg")
            }
          >
            <span className="dot dot-nonveg" /> Non-veg
          </button>
        </div>

        <div className="view-toggle">
          <button
            className={viewMode === "grid" ? "active" : ""}
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <GridIcon />
          </button>
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="menu-items-container">
          {activeCat === "All" && (
            <h2 className="menu-category-heading">{cat}</h2>
          )}
          <div className={`menu-items-grid view-${viewMode}`}>
            {items.map((item) => {
              const itemQty = cart[item.id]?.qty || 0;
              return (
              <div
                key={item.id}
                className={`menu-item-card${item.available ? "" : " card-unavailable"}`}
                onClick={() => setSelectedItem(item)}
                style={{ cursor: "pointer" }}
              >
                <div className="menu-item-image">
                  <img src={item.image || fallbackImage} alt={item.name} />
                  {cart[item.id] && (
                    <span className="card-cart-badge">{cart[item.id].qty}</span>
                  )}
                  {item.tag && (
                    <span className={`item-tag-badge tag-${item.tag}`}>
                      {item.tag === "new" && "New"}
                      {item.tag === "popular" && "⭐ Popular"}
                      {item.tag === "chef" && "👨‍🍳 Chef's"}
                    </span>
                  )}
                  {!item.available && (
                    <div className="sold-out-overlay">
                      <span>Unavailable</span>
                    </div>
                  )}
                </div>
                <div className="menu-item-content">
                  <div>
                    <div className="menu-item-cat-row">
                      <p className="menu-item-category">{item.category}</p>
                      {item.veg != null && (
                        <span
                          className={`card-diet-badge ${item.veg ? "veg" : "nonveg"}`}
                        >
                          <span className="diet-dot-inner" />
                        </span>
                      )}
                      {item.spice > 0 && (
                        <span
                          className="spice-indicator"
                          title={["", "Mild", "Medium", "Hot"][item.spice]}
                        >
                          {"🌶️".repeat(item.spice)}
                        </span>
                      )}
                    </div>
                    <p className="menu-item-name">{item.name}</p>
                    {item.desc && <p className="menu-item-desc">{item.desc}</p>}
                  </div>
                  <div className="menu-item-footer">
                    {item.discountPct > 0 ? (
                      <div className="menu-item-price-wrap">
                        <span className="menu-item-price-original">₹{item.price.toFixed(0)}</span>
                        <span className="menu-item-price menu-item-price--offer">₹{(item.price * (1 - item.discountPct / 100)).toFixed(0)}</span>
                        <span className="menu-item-discount-badge">{item.discountPct}% OFF</span>
                      </div>
                    ) : (
                      <span className="menu-item-price">₹{item.price.toFixed(0)}</span>
                    )}
                    <div className="menu-item-actions">
                      <span className={`menu-item-status ${item.available ? "available" : "unavailable"}`}>
                        {item.available ? "Available" : "Sold Out"}
                      </span>
                      {item.available && (itemQty > 0 ? (
                        <div
                          className="card-qty-stepper"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button onClick={() => onUpdateQty(item.id, itemQty - 1)}>−</button>
                          <span>{itemQty}</span>
                          <button onClick={() => onUpdateQty(item.id, itemQty + 1)}>+</button>
                        </div>
                      ) : (
                        <button
                          className="card-add-btn"
                          onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
                        >
                          Add to Order
                        </button>
                      ))}
                      {data.whatsapp && item.available && (
                        <a
                          className="whatsapp-btn"
                          href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi! I'd like to order: ${item.name} — ₹${item.price}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(grouped).length === 0 && (
        <div className="menu-empty-state">
          {searchQuery
            ? `No results for "${searchQuery}"`
            : "No items available in this category."}
        </div>
      )}

      {cartCount > 0 && (
        <div className="floating-cart-bar" onClick={onViewOrder}>
          <div className="cart-bar-left">
            <div className="cart-bar-icon">
              <svg
                width="15"
                height="15"
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
              <span className="cart-bar-count">{cartCount}</span>
            </div>
            <span className="cart-bar-label">
              item{cartCount !== 1 ? "s" : ""} in your order
            </span>
          </div>
          <div className="cart-bar-right">
            <span className="cart-bar-total">₹{cartTotal.toFixed(0)}</span>
            <span className="cart-bar-arrow">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </div>
      )}

      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          whatsapp={data.whatsapp}
          onClose={() => setSelectedItem(null)}
          cart={cart}
          onAddToCart={onAddToCart}
          onUpdateQty={onUpdateQty}
          itemNotes={itemNotes}
          onSetItemNote={onSetItemNote}
        />
      )}

      {showOrderSummary && lastOrder && (
        <div className="my-order-sheet" onClick={() => setShowOrderSummary(false)}>
          <div className="my-order-sheet__inner" onClick={(e) => e.stopPropagation()}>
            <div className="my-order-sheet__handle" />
            <div className="my-order-sheet__header">
              <div>
                <span className="my-order-sheet__badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Order Placed
                </span>
                <h3 className="my-order-sheet__title">Order #{lastOrder.orderNum}</h3>
              </div>
              <button className="my-order-sheet__close" onClick={() => setShowOrderSummary(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="my-order-sheet__items">
              {lastOrder.entries.map(({ item, qty }) => (
                <div key={item.id} className="my-order-sheet__row">
                  <span className="my-order-sheet__row-name">
                    {item.name} <span className="my-order-sheet__row-qty">×{qty}</span>
                  </span>
                  <span className="my-order-sheet__row-price">₹{(item.price * qty).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="my-order-sheet__total">
              <span>Total</span>
              <span>₹{lastOrder.total.toFixed(0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Menu page wrapper — loads data, shows welcome, then menu ──
function MenuPage({
  onBack,
  previewData,
  skipWelcome,
  cart,
  onAddToCart,
  onUpdateQty,
  onViewOrder,
  onDataLoaded,
  itemNotes,
  onSetItemNote,
  menuData,
  tableLabel,
  lastOrder,
}) {
  const [data, setData] = useState(previewData || DEFAULT_DATA);
  const [loaded, setLoaded] = useState(!!previewData);
  const [showWelcome, setShowWelcome] = useState(!previewData && !skipWelcome);
  const [showReview, setShowReview] = useState(false);

  const applyData = (d) => {
    const normalized = normalizeData(d);
    setData(normalized);
    onDataLoaded?.(normalized);
  };

  useEffect(() => {
    if (previewData) {
      onDataLoaded?.(normalizeData(previewData));
      return;
    }
    if (isFirebaseConfigured) {
      const unsub = onSnapshot(
        menuDoc,
        async (snap) => {
          if (snap.exists()) {
            applyData(snap.data());
          } else {
            try {
              const r = await browserStorage.get(STORAGE_KEY);
              if (r) applyData(JSON.parse(r.value));
            } catch {}
          }
          setLoaded(true);
        },
        async () => {
          try {
            const r = await browserStorage.get(STORAGE_KEY);
            if (r) applyData(JSON.parse(r.value));
          } catch {}
          setLoaded(true);
        },
      );
      return unsub;
    } else {
      (async () => {
        try {
          const r = await browserStorage.get(STORAGE_KEY);
          if (r) applyData(JSON.parse(r.value));
        } catch {}
        setLoaded(true);
      })();
    }
  }, [previewData]);

  // Show Google review prompt after 30s of browsing the menu
  useEffect(() => {
    if (showWelcome) return;
    if (localStorage.getItem("review-dismissed")) return;
    const t = setTimeout(() => setShowReview(true), 30000);
    return () => clearTimeout(t);
  }, [showWelcome]);

  const handleDismissReview = () => {
    setShowReview(false);
    localStorage.setItem("review-dismissed", "1");
  };

  if (!loaded) return <div className="loading-state">Loading…</div>;

  if (showWelcome)
    return (
      <WelcomeScreen
        data={data}
        onEnterMenu={() => {
          setShowWelcome(false);
        }}
      />
    );

  return (
    <>
      <MenuView
        data={data}
        cart={cart}
        onAddToCart={onAddToCart}
        onUpdateQty={onUpdateQty}
        onViewOrder={onViewOrder}
        onBackToWelcome={!previewData ? () => setShowWelcome(true) : undefined}
        itemNotes={itemNotes}
        onSetItemNote={onSetItemNote}
        menuData={menuData || data}
        tableLabel={tableLabel}
        lastOrder={lastOrder}
      />

      {showReview && data.googleReview && (
        <GoogleReviewPrompt
          url={data.googleReview}
          onClose={handleDismissReview}
        />
      )}
    </>
  );
}

// ── Table Booking Screen ───────────────────────────────────────────────────
function TableBookingScreen({ tableId, onConfirm }) {
  const [data, setData] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const dataRef = useRef(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      (async () => {
        try {
          const r = await browserStorage.get(STORAGE_KEY);
          if (r) { const d = normalizeData(JSON.parse(r.value)); setData(d); dataRef.current = d; }
        } catch {}
      })();
      return;
    }
    const unsub = onSnapshot(menuDoc, (snap) => {
      if (snap.exists()) {
        const d = normalizeData(snap.data());
        setData(d);
        dataRef.current = d;
      }
    });
    return unsub;
  }, []);

  const table = data?.tables?.find((t) => String(t.id) === String(tableId));
  const status = !table ? "loading" : !table.enabled ? "disabled" : table.booked ? "booked" : "available";

  const handleConfirm = async () => {
    if (confirming || !table) return;
    setConfirming(true);
    try {
      if (isFirebaseConfigured && dataRef.current) {
        const updated = dataRef.current.tables.map((t) =>
          String(t.id) === String(tableId) ? { ...t, booked: true } : t
        );
        await updateDoc(menuDoc, { tables: updated });
      }
      onConfirm({ id: table.id, label: table.label });
    } catch (_) {
      setConfirming(false);
    }
  };

  const restaurantName = data?.name || "";

  if (status === "loading" || !data) {
    return (
      <div className="tbs-page">
        <div className="tbs-spinner" />
      </div>
    );
  }

  if (status === "disabled") {
    return (
      <div className="tbs-page">
        <div className="tbs-card tbs-card--unavailable">
          <div className="tbs-icon tbs-icon--red">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <h2 className="tbs-title">Table Unavailable</h2>
          <p className="tbs-sub">This table has been marked as unavailable by the staff. Please ask for assistance.</p>
          {restaurantName && <p className="tbs-restaurant">{restaurantName}</p>}
        </div>
      </div>
    );
  }

  if (status === "booked") {
    return (
      <div className="tbs-page">
        <div className="tbs-card tbs-card--booked">

          {/* ── Glow accent ── */}
          <div className="tbs-card__glow" />

          {/* ── Occupied badge ── */}
          <div className="tbs-status-badge tbs-status-badge--booked">
            <span className="tbs-status-dot" />
            Currently Occupied
          </div>

          {/* ── Icon ── */}
          <div className="tbs-icon tbs-icon--amber">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="3" rx="1"/><line x1="7" y1="9" x2="7" y2="18"/><line x1="17" y1="9" x2="17" y2="18"/><line x1="5" y1="18" x2="9" y2="18"/><line x1="15" y1="18" x2="19" y2="18"/>
            </svg>
          </div>

          {/* ── Restaurant & table name ── */}
          {restaurantName && <p className="tbs-restaurant-name">{restaurantName}</p>}
          <h2 className="tbs-title">{table.label}</h2>
          <p className="tbs-sub">This table is currently taken. Please speak to a staff member for seating.</p>

          {/* ── Info chips ── */}
          <div className="tbs-chips">
            <span className="tbs-chip tbs-chip--amber">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Seat Taken
            </span>
            <span className="tbs-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              Ask Staff
            </span>
            <span className="tbs-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Try Later
            </span>
          </div>

          <p className="tbs-hint">Ask a staff member for available seating options</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tbs-page">
      <div className="tbs-card tbs-card--available">

        {/* ── Glow accent ── */}
        <div className="tbs-card__glow" />

        {/* ── Available badge ── */}
        <div className="tbs-status-badge tbs-status-badge--available">
          <span className="tbs-status-dot" />
          Available Now
        </div>

        {/* ── Icon ── */}
        <div className="tbs-icon tbs-icon--green">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="18" height="3" rx="1"/><line x1="7" y1="9" x2="7" y2="18"/><line x1="17" y1="9" x2="17" y2="18"/><line x1="5" y1="18" x2="9" y2="18"/><line x1="15" y1="18" x2="19" y2="18"/>
          </svg>
        </div>

        {/* ── Restaurant & table name ── */}
        {restaurantName && <p className="tbs-restaurant-name">{restaurantName}</p>}
        <h2 className="tbs-title">{table.label}</h2>
        <p className="tbs-sub">Scan confirmed. Tap below to confirm your seat and start browsing the menu.</p>

        {/* ── Info chips ── */}
        <div className="tbs-chips">
          <span className="tbs-chip tbs-chip--green">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Seat Free
          </span>
          <span className="tbs-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Instant Access
          </span>
          <span className="tbs-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Digital Menu
          </span>
        </div>

        {/* ── CTA ── */}
        <button
          className={`tbs-confirm-btn ${confirming ? "tbs-confirm-btn--loading" : ""}`}
          onClick={handleConfirm}
          disabled={confirming}
        >
          {confirming ? (
            <span className="tbs-btn-spinner" />
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Confirm My Seat
            </>
          )}
        </button>

        <p className="tbs-hint">You'll be seated at this table for the duration of your visit</p>
      </div>
    </div>
  );
}

// ── Root — switches between admin and menu ──
export default function App() {
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "menu") return "menu";
    if (window.location.pathname.endsWith("/menu")) return "menu";
    if (window.location.hash === "#menu") return "menu";
    if (params.get("view") === "admin") return "admin";
    // Default: show landing page immediately, no auth wait needed
    return "home";
  });

  // ── Table booking state ──
  const tableParam = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("table") || null;
  }, []);
  const [bookedTable, setBookedTable] = useState(null); // { id, label } once confirmed

  const [authStatus, setAuthStatus] = useState("loading"); // "loading" | "in" | "out"
  const [previewData, setPreviewData] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [cart, setCart] = useState({});
  const [skipWelcome, setSkipWelcome] = useState(false);
  const [itemNotes, setItemNotes] = useState({});
  const [lastOrder, setLastOrder] = useState(null);
  const [activeOrderDocId, setActiveOrderDocId] = useState(null);
  const [activeOrderNum, setActiveOrderNum] = useState(null);

  useEffect(() => {
    // Accept local bypass session immediately
    if (sessionStorage.getItem(LOCAL_KEY)) { setAuthStatus("in"); return; }
    if (!auth) { setAuthStatus("out"); return; }
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthStatus(user ? "in" : "out");
    });
    return unsub;
  }, []);

  const setItemNote = (id, note) => setItemNotes(prev => ({ ...prev, [id]: note }));

  const addToCart = (item, variant = null, addons = []) => {
    const addonTotal = addons.reduce((s, a) => s + a.price, 0);
    const variantDelta = variant?.price || 0;
    const basePrice = item.discountPct > 0 ? item.price * (1 - item.discountPct / 100) : item.price;
    const adjustedItem = { ...item, price: basePrice + variantDelta + addonTotal, variant, addons };
    setCart(prev => ({
      ...prev,
      [item.id]: { item: adjustedItem, qty: (prev[item.id]?.qty || 0) + 1 },
    }));
  };

  const updateQty = (itemId, qty) =>
    setCart((prev) => {
      if (qty <= 0) {
        const n = { ...prev };
        delete n[itemId];
        return n;
      }
      return { ...prev, [itemId]: { ...prev[itemId], qty } };
    });

  const clearCart = () => setCart({});

  const handlePreview = (data) => {
    setPreviewData(data);
    setView("menu");
  };

  const logOrder = async (entries, total, orderNum, mobile) => {
    setLastOrder({ entries, total, orderNum });
    if (!isFirebaseConfigured || !ordersCol) return;
    try {
      const payload = {
        items: entries.map(({ item, qty }) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty,
          variant: item.variant || null,
          addons: item.addons || [],
          note: itemNotes[item.id] || "",
        })),
        total,
        status: "pending",
        timestamp: serverTimestamp(),
        ...(mobile ? { mobile } : {}),
        ...(bookedTable ? { tableId: bookedTable.id, tableLabel: bookedTable.label } : {}),
      };
      if (activeOrderDocId) {
        // Same session — update the existing order, keep the same doc
        await updateDoc(doc(db, "orders", activeOrderDocId), payload);
      } else {
        // First placement — create a new doc and remember its ID
        const ref = await addDoc(ordersCol, payload);
        setActiveOrderDocId(ref.id);
        setActiveOrderNum(orderNum);
      }
    } catch (_) {}
  };

  const handleReorder = (lastEntries) => {
    const restored = {};
    lastEntries.forEach(({ item, qty }) => {
      restored[item.id] = { item, qty };
    });
    setCart(restored);
  };

  // ── Landing page — rendered immediately, no auth required ──
  if (view === "home")
    return (
      <HomePage
        onSignIn={() => setView("auth")}
        onGetStarted={() => setView("auth")}
      />
    );

  if (view === "order")
    return (
      <OrderPage
        cart={cart}
        onUpdateQty={updateQty}
        onClear={clearCart}
        whatsapp={menuData?.whatsapp || ""}
        onBack={() => { setSkipWelcome(true); setView("menu"); }}
        onOrderPlaced={logOrder}
        itemNotes={itemNotes}
        onReorder={handleReorder}
        restaurantName={menuData?.name || ""}
        tableLabel={bookedTable?.label || null}
        tableId={bookedTable?.id || null}
        initialOrderNum={activeOrderNum}
        upiId={menuData?.upiId || ""}
        orderDocId={activeOrderDocId}
      />
    );

  // ── Table booking gate — show confirmation screen before menu ──
  if (view === "menu" && tableParam && !bookedTable)
    return (
      <TableBookingScreen
        tableId={tableParam}
        onConfirm={(table) => { setBookedTable(table); setSkipWelcome(true); }}
      />
    );

  if (view === "menu")
    return (
      <MenuPage
        onBack={() => {
          setPreviewData(null);
          setSkipWelcome(false);
          setView("admin");
        }}
        previewData={previewData}
        skipWelcome={skipWelcome}
        cart={cart}
        onAddToCart={addToCart}
        onUpdateQty={updateQty}
        onViewOrder={() => { setSkipWelcome(false); setView("order"); }}
        onDataLoaded={setMenuData}
        itemNotes={itemNotes}
        onSetItemNote={setItemNote}
        menuData={menuData}
        tableLabel={bookedTable?.label || null}
        lastOrder={lastOrder}
      />
    );

  // Auth loading
  if (authStatus === "loading")
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner" />
      </div>
    );

  // Not signed in → landing page (or auth page if explicitly requested)
  if (authStatus === "out") {
    if (view === "auth")
      return <AuthPage onSuccess={() => { setAuthStatus("in"); setView("admin"); }} />;
    return (
      <HomePage
        onSignIn={() => setView("auth")}
        onGetStarted={() => setView("auth")}
      />
    );
  }

  // Signed in → show dashboard
  return (
    <AdminPanel
      onPreview={handlePreview}
      onLogout={() => {
        sessionStorage.removeItem(LOCAL_KEY);
        setAuthStatus("out");
      }}
    />
  );
}
