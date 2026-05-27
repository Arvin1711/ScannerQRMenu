import React from "react";

export const PhoneLeft = () => (
  <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column" }}>
    <div style={{ width: "84px", height: "10px", background: "#16172a", borderRadius: "0 0 10px 10px", margin: "0 auto 0", flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 10px 12px" }}>
      <div style={{ borderRadius: "14px", overflow: "hidden", background: "linear-gradient(135deg,#fef3c7,#fde68a)", flex: "0 0 120px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", position: "relative" }}>
        <svg width="70" height="70" viewBox="0 0 70 70">
          <circle cx="35" cy="35" r="30" fill="#fbbf24" opacity="0.4" />
          <ellipse cx="35" cy="38" rx="22" ry="16" fill="#f59e0b" />
          <ellipse cx="35" cy="32" rx="18" ry="13" fill="#fbbf24" />
          <ellipse cx="35" cy="30" rx="12" ry="9" fill="#f97316" opacity="0.7" />
          <path d="M22 28 Q35 18 48 28" stroke="#92400e" strokeWidth="2" fill="none" opacity="0.4" />
          <circle cx="29" cy="26" r="3" fill="#fff" opacity="0.5" />
        </svg>
        <div style={{ position: "absolute", top: "8px", right: "8px", background: "#111", color: "#fff", borderRadius: "6px", padding: "2px 8px", fontSize: "9px", fontWeight: 700 }}>Popular</div>
      </div>
      <div style={{ fontSize: "12px", fontWeight: 800, color: "#111", marginBottom: "3px", letterSpacing: "-0.01em" }}>Pallapinach Bowl</div>
      <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "10px" }}>Fresh & Healthy</div>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
        {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ color: "#f59e0b", fontSize: "10px" }}>★</span>)}
        <span style={{ fontSize: "9px", color: "#9ca3af", marginLeft: "2px" }}>(24)</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "16px", fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>₹280</span>
        <span style={{ background: "#4f46e5", color: "#fff", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", fontWeight: 700 }}>+ Add</span>
      </div>
      <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
        {["Veg", "Mild"].map((t) => (
          <span key={t} style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "9px", fontWeight: 600, background: "#f3f4f6", color: "#374151" }}>{t}</span>
        ))}
      </div>
    </div>
  </div>
);

export const PhoneCenter = () => (
  <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <div style={{ width: "84px", height: "10px", background: "#16172a", borderRadius: "0 0 12px 12px", margin: "0 auto", flexShrink: 0, zIndex: 1 }} />
    <div style={{ background: "linear-gradient(135deg,#fef9c3,#fef3c7)", padding: "30px 12px 20px", flexShrink: 0, marginTop: "-10px" }}>
      <div style={{ fontSize: "9px", color: "#9ca3af", marginBottom: "2px" }}>Welcome to</div>
      <div style={{ fontSize: "16px", fontWeight: 800, color: "#111", letterSpacing: "-0.02em", marginBottom: "8px" }}>Thai Menu</div>
      <div style={{ display: "flex", gap: "5px" }}>
        {["All", "Starters", "Main", "Dessert"].map((c, i) => (
          <span key={c} style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "8px", fontWeight: 700, background: i === 0 ? "#111" : "rgba(255,255,255,0.7)", color: i === 0 ? "#fff" : "#374151", border: i !== 0 ? "1px solid #e5e7eb" : "none" }}>{c}</span>
        ))}
      </div>
    </div>
    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "6px", flex: 1, overflow: "hidden" }}>
      {[
        { name: "Thai Basil Chicken", price: "₹320", color: "#fef3c7", emoji: "🍗" },
        { name: "Pad Thai Noodles",   price: "₹280", color: "#fce7f3", emoji: "🍜" },
        { name: "Green Curry Bowl",   price: "₹350", color: "#dcfce7", emoji: "🥘" },
        { name: "Tom Yum Soup",       price: "₹220", color: "#dbeafe", emoji: "🍲" },
        { name: "Mango Sticky Rice",  price: "₹180", color: "#fef3c7", emoji: "🍮" },
      ].map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", padding: "6px 8px", borderRadius: "10px", background: "#f9fafb", border: "1px solid #f3f4f6" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: item.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>{item.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>{item.name}</div>
            <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "1px" }}>{item.price}</div>
          </div>
          <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontSize: "12px", lineHeight: 1 }}>+</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PhoneRight = () => (
  <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column" }}>
    <div style={{ width: "84px", height: "10px", background: "#16172a", borderRadius: "0 0 12px 12px", margin: "0 auto", flexShrink: 0 }} />
    <div style={{ flex: 1, padding: "8px 10px 10px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "9px", color: "#9ca3af" }}>Restaurant</div>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#111", letterSpacing: "-0.01em" }}>Our Menu</div>
        </div>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🔍</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", flex: 1, overflow: "hidden" }}>
        {[
          { emoji: "🍔", name: "Classic Burger", price: "₹180", bg: "#fef3c7" },
          { emoji: "🍕", name: "Margherita",     price: "₹220", bg: "#fce7f3" },
          { emoji: "🍣", name: "Sushi Platter",  price: "₹340", bg: "#dbeafe" },
          { emoji: "🌮", name: "Tacos Duo",       price: "₹160", bg: "#dcfce7" },
        ].map((item, i) => (
          <div key={i} style={{ borderRadius: "10px", background: "#f9fafb", padding: "8px", display: "flex", flexDirection: "column", gap: "4px", border: "1px solid #f3f4f6" }}>
            <div style={{ width: "100%", height: "40px", borderRadius: "7px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "2px" }}>{item.emoji}</div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "#111", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{item.name}</div>
            <div style={{ fontSize: "9px", color: "#f97316", fontWeight: 800 }}>{item.price}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "8px", background: "#111", borderRadius: "10px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.6)" }}>2 items</div>
          <div style={{ fontSize: "11px", color: "#fff", fontWeight: 800 }}>₹400</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#4f46e5", borderRadius: "7px", padding: "5px 10px" }}>
          <span style={{ fontSize: "9px", color: "#fff", fontWeight: 700 }}>View Order</span>
        </div>
      </div>
    </div>
  </div>
);
