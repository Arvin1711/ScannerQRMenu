import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Table2 } from "lucide-react";
import { Button } from "./ui";

// ── Icons ──────────────────────────────────────────────────────────────────
function IcoPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IcoTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function IcoQR() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
    </svg>
  );
}

function IcoDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IcoUnlock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 019.9-1" />
    </svg>
  );
}

function IcoCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IcoBan() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function IcoSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ── Derive table status ────────────────────────────────────────────────────
function getStatus(table) {
  if (!table.enabled) return "disabled";
  if (table.booked)   return "booked";
  return "available";
}

// ── Toggle Switch ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      className={`tb-toggle ${checked ? "tb-toggle--on" : ""}`}
      onClick={onChange}
      disabled={disabled}
      title={disabled ? "Release table to change status" : checked ? "Click to disable" : "Click to enable"}
    >
      <span className="tb-toggle__track">
        <span className="tb-toggle__thumb" />
      </span>
    </button>
  );
}

// ── Bulk Pill Toggle ───────────────────────────────────────────────────────
function BulkToggle({ allEnabled, noneEnabled, onEnableAll, onDisableAll }) {
  // "on" = all enabled, "off" = all disabled, "mixed" = partial
  const state = allEnabled ? "on" : noneEnabled ? "off" : "mixed";

  return (
    <div className={`tb-bulk-toggle tb-bulk-toggle--${state}`} role="group" aria-label="Bulk table toggle">
      {/* Sliding pill indicator */}
      <div className="tb-bulk-toggle__pill" aria-hidden="true" />

      <button
        className="tb-bulk-toggle__opt tb-bulk-toggle__opt--left"
        onClick={onEnableAll}
        disabled={allEnabled}
        title="Enable all tables"
      >
        <IcoCheck />
        <span>Enable All</span>
      </button>

      <button
        className="tb-bulk-toggle__opt tb-bulk-toggle__opt--right"
        onClick={onDisableAll}
        disabled={noneEnabled}
        title="Disable all tables"
      >
        <IcoBan />
        <span>Disable All</span>
      </button>
    </div>
  );
}

// ── QR Modal ───────────────────────────────────────────────────────────────
function QRModal({ table, menuUrl, onClose }) {
  const canvasRef = useRef(null);
  const tableUrl = `${menuUrl}?view=menu&table=${table.id}`;

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${table.label.replace(/\s+/g, "-")}-QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="tb-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tb-modal tb-qr-modal">
        <div className="tb-modal__header">
          <div className="tb-modal__header-left">
            <div className="tb-modal__header-icon"><IcoQR /></div>
            <div>
              <h3 className="tb-modal__title">{table.label}</h3>
              <p className="tb-modal__subtitle">Scan to book this table</p>
            </div>
          </div>
          <button className="tb-modal__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="tb-qr-modal__body">
          <div className="tb-qr-modal__canvas" ref={canvasRef}>
            <QRCodeCanvas value={tableUrl} size={190} bgColor="#ffffff" fgColor="#1a1a1a" level="M" />
          </div>
          <p className="tb-qr-modal__url">{tableUrl}</p>
          <Button variant="primary" onClick={handleDownload}>
            <IcoDownload /> Download PNG
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Table Card ─────────────────────────────────────────────────────────────
function TableCard({ table, onToggle, onRemove, onRename, onRelease, onShowQR }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(table.label);
  const status = getStatus(table);

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== table.label) onRename(table.id, trimmed);
    setEditing(false);
  };

  const statusLabel = status === "available" ? "Available" : status === "booked" ? "Booked" : "Disabled";

  return (
    <div className={`tb-card tb-card--${status}`}>
      {/* Colored top stripe */}
      <div className="tb-card__stripe" />

      {/* Single row: icon + name + status + delete */}
      <div className="tb-card__header">
        <div className={`tb-card__icon tb-card__icon--${status}`}>
          <Table2 size={18} strokeWidth={2} />
        </div>
        <div className="tb-card__info">
          {editing ? (
            <input
              className="tb-card__rename"
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") { setDraft(table.label); setEditing(false); }
              }}
            />
          ) : (
            <p
              className="tb-card__name"
              onDoubleClick={() => { setDraft(table.label); setEditing(true); }}
              title="Double-click to rename"
            >
              {table.label}
            </p>
          )}
          <span className={`tb-card__status tb-card__status--${status}`}>
            <span className={`tb-card__status-dot ${status === "booked" ? "tb-card__status-dot--pulse" : ""}`} />
            {statusLabel}
          </span>
        </div>
        <button className="tb-card__delete" onClick={() => onRemove(table.id)} title="Remove table">
          <IcoTrash />
        </button>
      </div>

      {/* Release banner (booked only) */}
      {status === "booked" && (
        <button className="tb-card__release" onClick={() => onRelease(table.id)}>
          <IcoUnlock />
          Release Table
        </button>
      )}

      {/* Footer: QR + toggle */}
      <div className="tb-card__footer">
        <button className="tb-card__qr" onClick={() => onShowQR(table)}>
          <IcoQR />
          QR Code
        </button>
        <Toggle
          checked={table.enabled}
          onChange={() => onToggle(table.id)}
          disabled={table.booked}
        />
      </div>
    </div>
  );
}

// ── Add Table Modal ────────────────────────────────────────────────────────
function AddTableModal({ nextNumber, onAdd, onClose }) {
  const [label, setLabel] = useState(`Table ${nextNumber}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    onClose();
  };

  return (
    <div className="tb-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tb-modal">
        <div className="tb-modal__header">
          <div className="tb-modal__header-left">
            <div className="tb-modal__header-icon tb-modal__header-icon--accent">
              <IcoPlus />
            </div>
            <div>
              <h3 className="tb-modal__title">Add New Table</h3>
              <p className="tb-modal__subtitle">Give it a name to identify it</p>
            </div>
          </div>
          <button className="tb-modal__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="tb-modal__body">
          <div className="tb-modal__field">
            <label className="tb-modal__label">Table Name</label>
            <input
              className="tb-modal__input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
              placeholder="e.g. Table 10, VIP-1, Terrace 3…"
            />
          </div>
          <div className="tb-modal__actions">
            <button type="button" className="tb-modal__btn tb-modal__btn--cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="tb-modal__btn tb-modal__btn--add" disabled={!label.trim()}>
              <IcoPlus /> Add Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── TablesBook (main export) ───────────────────────────────────────────────
export default function TablesBook({ tables = [], menuUrl = "", onToggle, onAdd, onRemove, onRename, onToggleAll, onRelease }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [qrTable, setQrTable] = useState(null);
  const [search, setSearch] = useState("");

  const available = tables.filter((t) => t.enabled && !t.booked).length;
  const booked    = tables.filter((t) => t.booked).length;
  const disabled  = tables.filter((t) => !t.enabled).length;

  const visible = search.trim()
    ? tables.filter((t) => t.label.toLowerCase().includes(search.trim().toLowerCase()))
    : tables;

  const nextNumber = tables.length + 1;
  const allEnabled  = tables.length > 0 && tables.every((t) => t.enabled);
  const noneEnabled = tables.length > 0 && tables.every((t) => !t.enabled);

  return (
    <div className="tb-root">

      {/* ── Page Header ── */}
      <div className="tb-header">
        <div>
          <h2 className="tb-header__title">Table Management</h2>
          <p className="tb-header__sub">Manage your dining tables and their availability</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <IcoPlus /> Add Table
        </Button>
      </div>

      {/* ── Stat Chips ── */}
      <div className="tb-stats">
        <div className="tb-stat tb-stat--total">
          <div className="tb-stat__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="3" rx="1"/><line x1="7" y1="9" x2="7" y2="18"/><line x1="17" y1="9" x2="17" y2="18"/><line x1="5" y1="18" x2="9" y2="18"/><line x1="15" y1="18" x2="19" y2="18"/>
            </svg>
          </div>
          <span className="tb-stat__val">
            <span className="tb-stat__label">Total</span>
            {tables.length}
          </span>
          
        </div>
        <div className="tb-stat tb-stat--available">
          <div className="tb-stat__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="tb-stat__val">
            <span className="tb-stat__label">Available</span>
            {available}</span>
        </div>
        <div className="tb-stat tb-stat--booked">
          <div className="tb-stat__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <span className="tb-stat__val">
            <span className="tb-stat__label">Booked</span>
            {booked}
          </span>
        </div>
        <div className="tb-stat tb-stat--disabled">
          <div className="tb-stat__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
          <span className="tb-stat__val">
            <span className="tb-stat__label">Disabled</span>
            {disabled}
          </span>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="tb-toolbar">
        <div className="tb-search">
          <IcoSearch />
          <input
            className="tb-search__input"
            placeholder="Search tables…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="tb-search__clear" onClick={() => setSearch("")}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <BulkToggle
          allEnabled={allEnabled}
          noneEnabled={noneEnabled || tables.length === 0}
          onEnableAll={() => onToggleAll(true)}
          onDisableAll={() => onToggleAll(false)}
        />
      </div>

      {/* ── Grid ── */}
      {tables.length === 0 ? (
        <div className="tb-empty">
          <div className="tb-empty__art">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="3" rx="1"/><line x1="7" y1="9" x2="7" y2="18"/><line x1="17" y1="9" x2="17" y2="18"/><line x1="5" y1="18" x2="9" y2="18"/><line x1="15" y1="18" x2="19" y2="18"/>
            </svg>
          </div>
          <p className="tb-empty__title">No tables yet</p>
          <p className="tb-empty__sub">Add your first table and generate its QR code</p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <IcoPlus /> Add Your First Table
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <div className="tb-empty">
          <p className="tb-empty__title">No tables match "{search}"</p>
          <p className="tb-empty__sub">Try a different search term</p>
        </div>
      ) : (
        <div className="tb-grid">
          {visible.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onToggle={onToggle}
              onRemove={onRemove}
              onRename={onRename}
              onRelease={onRelease}
              onShowQR={setQrTable}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddTableModal nextNumber={nextNumber} onAdd={onAdd} onClose={() => setShowAddModal(false)} />
      )}
      {qrTable && (
        <QRModal table={qrTable} menuUrl={menuUrl} onClose={() => setQrTable(null)} />
      )}
    </div>
  );
}
