import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./src/components/ui/index.js";
import DashboardHome from "./src/components/DashboardHome.jsx";
import TablesBook from "./src/components/TablesBook.jsx";
import OrdersTab from "./src/components/OrdersTab.jsx";
import QRTab from "./src/components/QRTab.jsx";
import MenuCategories from "./src/components/MenuCategories.jsx";
import AnalyticsTab from "./src/components/AnalyticsTab.jsx";
import MenuManagement from "./src/components/MenuManagement.jsx";
import {
  setDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  db,
  auth,
  menuDoc,
  isFirebaseConfigured,
  ordersCol,
  reviewsCol,
} from "./src/firebase.js";
import { signOut } from "firebase/auth";
import {
  IcoDashboard,
  IcoQR,
  IcoItems,
  IcoCats,
  IcoAnalytics,
  IcoCalendar,
  IcoUser,
  IcoBag,
  IcoClose,
  IcoBell,
  IcoSearch,
  IcoMoon,
  IcoMenu,
} from "./src/icons.jsx";
import { LogOut, User } from "lucide-react";
export const STORAGE_KEY = "qr-restaurant-menu-v2";

const MENU_URL =
  import.meta.env.VITE_MENU_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "https://menu.yourdomain.com");

export const DEFAULT_DATA = {
  name: "La Bella Cucina",
  tagline: "Authentic Italian dining since 1987",
  whatsapp: "",
  googleReview: "",
  upiId: "",
  categories: ["Starters", "Mains", "Desserts", "Drinks"],
  items: [
    {
      id: 1,
      category: "Starters",
      name: "Bruschetta al Pomodoro",
      desc: "Toasted sourdough, heirloom tomatoes, fresh basil, aged balsamic",
      price: 320,
      available: true,
      veg: true,
      tag: "popular",
      spice: 0,
      image:
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      category: "Starters",
      name: "Burrata e Prosciutto",
      desc: "Creamy burrata, San Daniele prosciutto, rocket, truffle oil",
      price: 580,
      available: true,
      veg: false,
      tag: "chef",
      spice: 0,
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      category: "Mains",
      name: "Spaghetti Carbonara",
      desc: "Free-range eggs, Pecorino Romano, guanciale, black pepper",
      price: 740,
      available: true,
      veg: false,
      tag: "popular",
      spice: 1,
      image:
        "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      category: "Mains",
      name: "Risotto ai Funghi",
      desc: "Carnaroli rice, porcini mushrooms, Parmigiano, truffle oil",
      price: 890,
      available: true,
      veg: true,
      tag: "chef",
      spice: 0,
      image:
        "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      category: "Mains",
      name: "Bistecca alla Fiorentina",
      desc: "600g T-bone, rosemary, sea salt, Tuscan olive oil",
      price: 1950,
      available: true,
      veg: false,
      tag: null,
      spice: 2,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      category: "Desserts",
      name: "Tiramisù della Casa",
      desc: "House recipe mascarpone, Savoiardi, espresso, cocoa",
      price: 360,
      available: true,
      veg: true,
      tag: "popular",
      spice: 0,
      image:
        "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 7,
      category: "Desserts",
      name: "Panna Cotta",
      desc: "Vanilla bean cream, seasonal berry coulis",
      price: 320,
      available: true,
      veg: true,
      tag: null,
      spice: 0,
      image:
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 8,
      category: "Drinks",
      name: "Aperol Spritz",
      desc: "Aperol, Prosecco, soda, fresh orange slice",
      price: 440,
      available: true,
      veg: true,
      tag: null,
      spice: 0,
      image:
        "https://images.unsplash.com/photo-1510626176961-4b37f7a6a65c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 9,
      category: "Drinks",
      name: "Espresso Martini",
      desc: "Vodka, Kahlúa, fresh espresso, vanilla sugar",
      price: 520,
      available: true,
      veg: true,
      tag: "new",
      spice: 0,
      image:
        "https://images.unsplash.com/photo-1505253217347-5a0ec55e9e9f?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

export function normalizeData(raw) {
  return {
    whatsapp: "",
    googleReview: "",
    ...raw,
    items: (raw.items || []).map((item) => ({
      veg: null,
      tag: null,
      spice: 0,
      ...item,
    })),
    tables: (raw.tables || []).map((t) => ({ booked: false, ...t })),
  };
}

export const browserStorage = {
  async get(key) {
    const value = window.localStorage.getItem(key);
    return value ? { value } : null;
  },
  async set(key, value) {
    window.localStorage.setItem(key, value);
  },
};

// ── Helpers ──
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

// ── Order Detail Modal ──
function OrderDetailModal({ order, onClose, onStatusChange, onReleaseTable }) {
  const ts = order.timestamp?.toDate
    ? order.timestamp.toDate()
    : order.timestamp
      ? new Date(order.timestamp)
      : null;
  const total =
    order.total || order.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0;
  const status = order.status || "pending";

  const handleStatus = async (newStatus) => {
    if (!isFirebaseConfigured) return;
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });
      onStatusChange?.({ ...order, status: newStatus });
      if (newStatus === "done" && order.tableId) {
        onReleaseTable?.(order.tableId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="odm-overlay" onClick={onClose}>
      <div className="odm" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="odm__header">
          <div className="odm__header-left">
            <div className="odm__icon">
              <IcoBag size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="odm__title">Order Details</h3>
              <p className="odm__meta">
                {ts
                  ? ts.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </p>
            </div>
          </div>
          <button className="odm__close" onClick={onClose}>
            <IcoClose />
          </button>
        </div>

        {/* Table + time info row */}
        <div className="odm__info-row">
          {order.tableLabel ? (
            <span className="odm__source-chip odm__source-chip--table">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="6" width="18" height="3" rx="1" />
                <line x1="7" y1="9" x2="7" y2="18" />
                <line x1="17" y1="9" x2="17" y2="18" />
                <line x1="5" y1="18" x2="9" y2="18" />
                <line x1="15" y1="18" x2="19" y2="18" />
              </svg>
              {order.tableLabel}
            </span>
          ) : (
            <span className="odm__source-chip odm__source-chip--qr">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="17" y="17" width="4" height="4" rx="0.5" />
              </svg>
              Menu QR
            </span>
          )}
          {ts && (
            <span className="odm__time-chip">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {fmtTime(ts)} &nbsp;·&nbsp; {timeAgo(ts)}
            </span>
          )}
        </div>

        {/* Status badge + toggle */}
        <div className="odm__status-row">
          <span className={`odm__status-badge odm__status-badge--${status}`}>
            {status === "pending" ? "⏳ Pending" : "✓ Done"}
          </span>
          <div className="odm__status-btns">
            <button
              className={`odm__status-btn odm__status-btn--pending ${status === "pending" ? "active" : ""}`}
              onClick={() => handleStatus("pending")}
            >
              Pending
            </button>
            <button
              className={`odm__status-btn odm__status-btn--done ${status === "done" ? "active" : ""}`}
              onClick={() => handleStatus("done")}
            >
              Done
            </button>
          </div>
        </div>

        {/* Items list */}
        <div className="odm__items">
          {(order.items || []).map((item, i) => (
            <div key={i} className="odm__item-row">
              <span className="odm__item-name">{item.name}</span>
              <span className="odm__item-qty">×{item.qty}</span>
              <span className="odm__item-price">
                ₹{(item.price * item.qty).toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="odm__total-row">
          <span className="odm__total-label">Total</span>
          <span className="odm__total-val">₹{total.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Order Toast ──
function OrderToast({ order, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, []);

  const total =
    order.total || order.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0;
  const itemCount = order.items?.reduce((s, i) => s + i.qty, 0) || 0;

  return (
    <div className="notif-toast" onClick={onClose}>
      <div className="notif-toast__icon">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      </div>
      <div className="notif-toast__body">
        <p className="notif-toast__title">
          New Order{order.tableLabel ? ` — ${order.tableLabel}` : ""}!
        </p>
        <p className="notif-toast__sub">
          {itemCount} item{itemCount !== 1 ? "s" : ""} &nbsp;·&nbsp; ₹
          {total.toFixed(0)}
          {order.tableLabel && (
            <>
              {" "}
              &nbsp;·&nbsp; <strong>{order.tableLabel}</strong>
            </>
          )}
        </p>
      </div>
      <button className="notif-toast__close" onClick={onClose}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="notif-toast__progress" />
    </div>
  );
}

// ── Notification Dropdown ──
function NotifDropdown({
  orders,
  unreadIds,
  onClose,
  onMarkAll,
  onOrderClick,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const recent = orders.slice(0, 8);

  return (
    <div className="notif-dropdown" ref={ref}>
      <div className="notif-dropdown__header">
        <span className="notif-dropdown__title">Notifications</span>
        {unreadIds.size > 0 && (
          <button className="notif-dropdown__mark-all" onClick={onMarkAll}>
            Mark all as read
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="notif-dropdown__empty">No orders yet</div>
      ) : (
        <ul className="notif-dropdown__list">
          {recent.map((o) => {
            const ts = o.timestamp?.toDate
              ? o.timestamp.toDate()
              : o.timestamp
                ? new Date(o.timestamp)
                : null;
            const total =
              o.total || o.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0;
            const itemCount = o.items?.reduce((s, i) => s + i.qty, 0) || 0;
            const isUnread = unreadIds.has(o.id);
            const status = o.status || "pending";
            return (
              <li
                key={o.id}
                className={`notif-item ${isUnread ? "notif-item--unread" : ""}`}
                onClick={() => {
                  onOrderClick?.(o);
                  onClose();
                }}
                style={{ cursor: "pointer" }}
              >
                {isUnread && <span className="notif-item__dot" />}
                <div className="notif-item__icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <div className="notif-item__body">
                  <div className="notif-item__top-row">
                    <p className="notif-item__label">
                      New Order &nbsp;
                      <span className="notif-item__sub">
                        {itemCount} item{itemCount !== 1 ? "s" : ""} · ₹
                        {total.toFixed(0)}
                      </span>
                    </p>
                    <span
                      className={`notif-item__status notif-item__status--${status}`}
                    >
                      {status === "pending" ? "Pending" : "Done"}
                    </span>
                  </div>
                  {o.items && o.items.length > 0 && (
                    <p className="notif-item__items">
                      {o.items
                        .slice(0, 2)
                        .map((i) => i.name)
                        .join(", ")}
                      {o.items.length > 2 ? ` +${o.items.length - 2} more` : ""}
                    </p>
                  )}
                  <p className="notif-item__time">{timeAgo(ts)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Sidebar ──
function Sidebar({ tab, setTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: "dashboard", Icon: IcoDashboard, label: "Dashboard" },
    { id: "qr", Icon: IcoQR, label: "QR Code" },
    { id: "orders", Icon: IcoItems, label: "Orders" },
    { id: "items", Icon: IcoItems, label: "Menu Management" },
    { id: "cats", Icon: IcoCats, label: "Menu Categories" },
    { id: "tables", Icon: IcoItems, label: "Table Booked" },
    { id: "analytics", Icon: IcoAnalytics, label: "Customer Feedback" },
  ];

  return (
    <aside className="ta-sidebar">
      <div className="ta-sidebar__logo">
        <div className="ta-sidebar__logo-mark">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </div>
        <span className="ta-sidebar__logo-text">Admin Panel</span>
      </div>

      <nav className="ta-sidebar__nav">
        <p className="ta-sidebar__section-label">MENU</p>
        {navItems.map(({ id, Icon, label }) => (
          <button
            key={id}
            className={`ta-sidebar__item ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Support nav */}
      <nav className="ta-sidebar__nav ta-sidebar__nav--bottom">
        <p className="ta-sidebar__section-label">SUPPORT</p>
        <button className="ta-sidebar__item">
          <IcoCalendar />
          <span>Calendar</span>
        </button>
        <button className="ta-sidebar__item">
          <IcoUser />
          <span>User Profile</span>
        </button>
      </nav>
    </aside>
  );
}

// ── Profile Dropdown ──
function ProfileDropdown({ data, onClose, onEditInfo, onLogout }) {
  return (
    <div className="ta-profile-dropdown">
      {/* User info header */}
      <div className="ta-profile-dropdown__header">
        <div className="ta-profile-dropdown__avatar">
          {(data.name || "A").charAt(0).toUpperCase()}
        </div>
        <div className="ta-profile-dropdown__info">
          <p className="ta-profile-dropdown__name">{data.name || "Admin"}</p>
          <p className="ta-profile-dropdown__role">Restaurant Admin</p>
        </div>
      </div>

      <div className="ta-profile-dropdown__divider" />

      {/* Menu items */}
      <ul className="ta-profile-dropdown__menu">
        <li>
          <button
            className="ta-profile-dropdown__item"
            onClick={() => {
              onEditInfo?.();
              onClose();
            }}
          >
            <User size={18} />
            Profile
          </button>
        </li>
        <li>
          <button
            className="ta-profile-dropdown__item ta-profile-dropdown__item--danger"
            onClick={async () => {
              onClose();
              if (auth) await signOut(auth);
              onLogout?.();
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

// ── Top Bar ──
function Topbar({
  data,
  savedMsg,
  saveError,
  orders,
  unreadIds,
  notifOpen,
  onToggleNotif,
  onMarkAllRead,
  onOrderClick,
  onEditInfo,
  onLogout,
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="ta-topbar">
      <button className="ta-topbar__hamburger">
        <IcoMenu />
      </button>

      <div className="ta-topbar__search">
        <IcoSearch />
        <input
          type="text"
          placeholder="Search or type command..."
          className="ta-topbar__search-input"
          readOnly
        />
        <kbd className="ta-topbar__kbd">⌘K</kbd>
      </div>

      <div className="ta-topbar__right">
        {savedMsg && <span className="ta-topbar__saved">✓ Saved</span>}
        {saveError && <span className="ta-topbar__error">{saveError}</span>}

        <button className="ta-topbar__icon-btn" title="Toggle dark mode">
          <IcoMoon />
        </button>

        {/* ── Notification Bell ── */}
        <div className="ta-notif-wrap">
          <button
            className={`ta-topbar__icon-btn ta-notif-bell ${notifOpen ? "active" : ""}`}
            title="Notifications"
            onClick={onToggleNotif}
          >
            <IcoBell />
            {unreadIds.size > 0 && (
              <span className="ta-notif-badge">
                {unreadIds.size > 9 ? "9+" : unreadIds.size}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotifDropdown
              orders={orders}
              unreadIds={unreadIds}
              onClose={onToggleNotif}
              onMarkAll={onMarkAllRead}
              onOrderClick={onOrderClick}
            />
          )}
        </div>

        {/* ── Profile ── */}
        <div className="ta-profile-wrap">
          <button
            className={`ta-topbar__user ${profileOpen ? "active" : ""}`}
            onClick={() => setProfileOpen((o) => !o)}
          >
            <div className="ta-topbar__avatar">
              {(data?.name || "A").charAt(0).toUpperCase()}
            </div>
            <span className="ta-topbar__username">
              {(data?.name || "Admin").split(" ")[0]}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ marginLeft: 2, opacity: 0.5 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {profileOpen && (
            <>
              <div
                className="ta-profile-overlay"
                onClick={() => setProfileOpen(false)}
              />
              <ProfileDropdown
                data={data}
                onClose={() => setProfileOpen(false)}
                onEditInfo={onEditInfo}
                onLogout={onLogout}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Admin Panel ──
export default function AdminPanel({ onPreview, onLogout }) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [savedMsg, setSavedMsg] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editRestaurant, setEditRestaurant] = useState(false);
  const [restForm, setRestForm] = useState({});
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  // ── Notification state ──
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadIds, setUnreadIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const prevOrderIds = useRef(new Set());
  const lastSeenAt = useRef(
    new Date(parseInt(localStorage.getItem("admin-notif-seen-at") || "0")),
  );

  // ── Waiter call / bill request state ──
  useEffect(() => {
    if (!isFirebaseConfigured || !ordersCol || !reviewsCol) return;
    const qOrders = query(ordersCol, orderBy("timestamp", "desc"));
    const unsubOrders = onSnapshot(
      qOrders,
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      () => {},
    );
    const qReviews = query(reviewsCol, orderBy("timestamp", "desc"));
    const unsubReviews = onSnapshot(
      qReviews,
      (snap) => {
        setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      () => {},
    );
    return () => {
      unsubOrders();
      unsubReviews();
    };
  }, []);

  // Detect newly arrived orders → badge + toast
  useEffect(() => {
    if (orders.length === 0) return;

    const newlyArrived = orders.filter((o) => !prevOrderIds.current.has(o.id));

    if (newlyArrived.length > 0) {
      // Mark unread: any order newer than when the panel last opened notifs
      const unread = new Set(
        orders
          .filter((o) => {
            const t = o.timestamp?.toDate
              ? o.timestamp.toDate()
              : o.timestamp
                ? new Date(o.timestamp)
                : null;
            return t && t > lastSeenAt.current;
          })
          .map((o) => o.id),
      );
      setUnreadIds(unread);

      // Show toast only for orders that just arrived (not on initial load)
      if (prevOrderIds.current.size > 0 && newlyArrived.length > 0) {
        setToast(newlyArrived[0]);
      }
    }

    prevOrderIds.current = new Set(orders.map((o) => o.id));
  }, [orders]);

  const handleToggleNotif = useCallback(() => {
    setNotifOpen((prev) => {
      if (!prev) {
        // Opening: mark all as read
        const now = Date.now();
        lastSeenAt.current = new Date(now);
        localStorage.setItem("admin-notif-seen-at", String(now));
        setUnreadIds(new Set());
      }
      return !prev;
    });
  }, []);

  const handleMarkAllRead = useCallback(() => {
    const now = Date.now();
    lastSeenAt.current = new Date(now);
    localStorage.setItem("admin-notif-seen-at", String(now));
    setUnreadIds(new Set());
  }, []);

  const togglePublish = useCallback(async (id, current) => {
    if (!isFirebaseConfigured) return;
    try {
      await updateDoc(doc(db, "reviews", id), { published: !current });
    } catch (e) {
      console.error("Failed to update review:", e);
    }
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = onSnapshot(
        menuDoc,
        async (snap) => {
          if (snap.exists()) {
            setData(normalizeData(snap.data()));
          } else {
            try {
              const r = await browserStorage.get(STORAGE_KEY);
              if (r) setData(normalizeData(JSON.parse(r.value)));
            } catch {}
          }
          setLoaded(true);
        },
        async (err) => {
          console.error("Firestore read error:", err.code, err.message);
          try {
            const r = await browserStorage.get(STORAGE_KEY);
            if (r) setData(normalizeData(JSON.parse(r.value)));
          } catch {}
          setLoaded(true);
        },
      );
      return unsub;
    } else {
      (async () => {
        try {
          const r = await browserStorage.get(STORAGE_KEY);
          if (r) setData(normalizeData(JSON.parse(r.value)));
        } catch {}
        setLoaded(true);
      })();
    }
  }, []);

  const persist = useCallback(async (next) => {
    setData(next);
    try {
      await browserStorage.set(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    if (isFirebaseConfigured) {
      try {
        await setDoc(menuDoc, next);
      } catch (e) {
        console.error("Firestore write failed:", e.code, e.message);
        setSaveError("Cloud sync failed — changes saved locally only.");
        setTimeout(() => setSaveError(""), 4000);
      }
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2200);
  }, []);

  // ── Table management ──
  const addTable = (label) => {
    const newTable = { id: Date.now(), label, enabled: true, booked: false };
    persist({ ...data, tables: [...(data.tables || []), newTable] });
  };

  const toggleTable = (id) =>
    persist({
      ...data,
      tables: (data.tables || []).map((t) =>
        t.id === id
          ? { ...t, enabled: !t.enabled, booked: t.enabled ? false : t.booked }
          : t,
      ),
    });

  const removeTable = (id) =>
    persist({
      ...data,
      tables: (data.tables || []).filter((t) => t.id !== id),
    });

  const renameTable = (id, label) =>
    persist({
      ...data,
      tables: (data.tables || []).map((t) =>
        t.id === id ? { ...t, label } : t,
      ),
    });

  const toggleAllTables = (enabled) =>
    persist({
      ...data,
      tables: (data.tables || []).map((t) => ({
        ...t,
        enabled,
        booked: enabled ? t.booked : false,
      })),
    });

  const releaseTable = (id) =>
    persist({
      ...data,
      tables: (data.tables || []).map((t) =>
        t.id === id ? { ...t, booked: false } : t,
      ),
    });

  const deleteOrder = (id) => deleteDoc(doc(db, "orders", id));

  if (!loaded) return <div className="loading-state">Loading…</div>;

  return (
    <>
      <div className="ta-shell">
        {/* ── Sidebar ── */}
        <Sidebar tab={tab} setTab={setTab} />

        {/* ── Main area ── */}
        <div className="ta-main">
          <Topbar
            data={data}
            savedMsg={savedMsg}
            saveError={saveError}
            orders={orders}
            unreadIds={unreadIds}
            notifOpen={notifOpen}
            onToggleNotif={handleToggleNotif}
            onMarkAllRead={handleMarkAllRead}
            onOrderClick={setSelectedOrder}
            onEditInfo={() => {
              setRestForm({
                name: data.name,
                tagline: data.tagline,
                whatsapp: data.whatsapp,
                googleReview: data.googleReview,
                upiId: data.upiId || "",
              });
              setEditRestaurant(true);
            }}
            onLogout={onLogout}
          />

          <main className="ta-content">
            {/* == DashboardHome == */}
            {tab === "dashboard" && (
              <DashboardHome
                orders={orders}
                data={data}
                reviews={reviews}
                onPreview={() => onPreview(data)}
                onEditInfo={() => {
                  setRestForm({
                    name: data.name,
                    tagline: data.tagline,
                    whatsapp: data.whatsapp,
                    googleReview: data.googleReview,
                    upiId: data.upiId || "",
                  });
                  setEditRestaurant(true);
                }}
              />
            )}

            {/* == ORDERSTABS == */}
            {tab === "orders" && (
              <OrdersTab
                orders={orders}
                onSelectOrder={setSelectedOrder}
                onReleaseTable={releaseTable}
                onDeleteOrder={deleteOrder}
                restaurantName={data.name}
                upiId={data.upiId}
              />
            )}

            {/* == QR TAB == */}
            {tab === "qr" && <QRTab menuUrl={MENU_URL} data={data} />}

            {/* == ITEMSTABS == */}
            {tab === "items" && (
              <MenuManagement data={data} onPersist={persist} />
            )}

            {/* == CATEGORIES TABS == */}
            {tab === "cats" && (
              <MenuCategories data={data} onPersist={persist} />
            )}

            {/* == TABLE TABS == */}
            {tab === "tables" && (
              <TablesBook
                tables={data.tables || []}
                menuUrl={MENU_URL}
                onToggle={toggleTable}
                onAdd={addTable}
                onRemove={removeTable}
                onRename={renameTable}
                onToggleAll={toggleAllTables}
                onRelease={releaseTable}
              />
            )}

            {/* == ANALYTICS TAB == */}
            {tab === "analytics" && (
              <AnalyticsTab reviews={reviews} onTogglePublish={togglePublish} />
            )}
          </main>
        </div>
      </div>

      {/* == ORDER TOAST == */}
      {toast && <OrderToast order={toast} onClose={() => setToast(null)} />}

      {/* == ORDER DETAIL MODAL == */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(updated) => {
            setSelectedOrder(updated);
            setOrders((prev) =>
              prev.map((o) =>
                o.id === updated.id ? { ...o, status: updated.status } : o,
              ),
            );
          }}
          onReleaseTable={releaseTable}
        />
      )}

      {/* == EDIT RESTAURANT INFO MODAL == */}
      {editRestaurant && (
        <div
          className="modal-overlay small"
          onClick={(e) =>
            e.target === e.currentTarget && setEditRestaurant(false)
          }
        >
          <div className="modal-content">
            <h2>Restaurant info</h2>
            <div className="form-group">
              <div className="form-field">
                <label>Restaurant name</label>
                <input
                  value={restForm.name || ""}
                  onChange={(e) =>
                    setRestForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="form-field">
                <label>Tagline</label>
                <input
                  value={restForm.tagline || ""}
                  onChange={(e) =>
                    setRestForm((f) => ({ ...f, tagline: e.target.value }))
                  }
                />
              </div>
              <div className="form-field">
                <label>WhatsApp number (with country code)</label>
                <input
                  value={restForm.whatsapp || ""}
                  onChange={(e) =>
                    setRestForm((f) => ({ ...f, whatsapp: e.target.value }))
                  }
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="form-field">
                <label>Google Review URL</label>
                <input
                  value={restForm.googleReview || ""}
                  onChange={(e) =>
                    setRestForm((f) => ({ ...f, googleReview: e.target.value }))
                  }
                  placeholder="https://g.page/r/..."
                />
              </div>
              <div className="form-field">
                <label>UPI ID (for customer payments)</label>
                <input
                  value={restForm.upiId || ""}
                  onChange={(e) =>
                    setRestForm((f) => ({ ...f, upiId: e.target.value }))
                  }
                  placeholder="yourname@upi"
                />
              </div>
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setEditRestaurant(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  persist({
                    ...data,
                    name: restForm.name,
                    tagline: restForm.tagline,
                    whatsapp: restForm.whatsapp,
                    googleReview: restForm.googleReview,
                    upiId: restForm.upiId,
                  });
                  setEditRestaurant(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
