import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Ban, Check, Download, Lock, LockOpen, Plus, QrCode, Search, Table2, Trash2, X } from "lucide-react";
import { Button } from "./ui";

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
        <Check size={13} strokeWidth={2.5} />
        <span>Enable All</span>
      </button>

      <button
        className="tb-bulk-toggle__opt tb-bulk-toggle__opt--right"
        onClick={onDisableAll}
        disabled={noneEnabled}
        title="Disable all tables"
      >
        <Ban size={13} strokeWidth={2.2} />
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
            <div className="tb-modal__header-icon"><QrCode size={14} strokeWidth={2} /></div>
            <div>
              <h3 className="tb-modal__title">{table.label}</h3>
              <p className="tb-modal__subtitle">Scan to book this table</p>
            </div>
          </div>
          <button className="tb-modal__close" onClick={onClose}>
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>
        <div className="tb-qr-modal__body">
          <div className="tb-qr-modal__canvas" ref={canvasRef}>
            <QRCodeCanvas value={tableUrl} size={190} bgColor="#ffffff" fgColor="#1a1a1a" level="M" />
          </div>
          <p className="tb-qr-modal__url">{tableUrl}</p>
          <Button variant="primary" onClick={handleDownload}>
            <Download size={14} strokeWidth={2} /> Download PNG
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
          <Trash2 size={13} strokeWidth={2} />
        </button>
      </div>

      {/* Release banner (booked only) */}
      {status === "booked" && (
        <button className="tb-card__release" onClick={() => onRelease(table.id)}>
          <LockOpen size={13} strokeWidth={2.2} />
          Release Table
        </button>
      )}

      {/* Footer: QR + toggle */}
      <div className="tb-card__footer">
        <button className="tb-card__qr" onClick={() => onShowQR(table)}>
          <QrCode size={14} strokeWidth={2} />
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
              <Plus size={15} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="tb-modal__title">Add New Table</h3>
              <p className="tb-modal__subtitle">Give it a name to identify it</p>
            </div>
          </div>
          <button className="tb-modal__close" onClick={onClose}>
            <X size={16} strokeWidth={2.2} />
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
              <Plus size={15} strokeWidth={2.5} /> Add Table
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
          <Plus size={15} strokeWidth={2.5} /> Add Table
        </Button>
      </div>

      {/* ── Stat Chips ── */}
      <div className="tb-stats">
        <div className="tb-stat tb-stat--total">
          <div className="tb-stat__icon">
            <Table2 size={16} strokeWidth={2} />
          </div>
          <span className="tb-stat__val">
            <span className="tb-stat__label">Total</span>
            {tables.length}
          </span>
        </div>
        <div className="tb-stat tb-stat--available">
          <div className="tb-stat__icon">
            <Check size={16} strokeWidth={2.2} />
          </div>
          <span className="tb-stat__val">
            <span className="tb-stat__label">Available</span>
            {available}
          </span>
        </div>
        <div className="tb-stat tb-stat--booked">
          <div className="tb-stat__icon">
            <Lock size={16} strokeWidth={2.2} />
          </div>
          <span className="tb-stat__val">
            <span className="tb-stat__label">Booked</span>
            {booked}
          </span>
        </div>
        <div className="tb-stat tb-stat--disabled">
          <div className="tb-stat__icon">
            <Ban size={16} strokeWidth={2.2} />
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
          <Search size={14} strokeWidth={2.2} />
          <input
            className="tb-search__input"
            placeholder="Search tables…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="tb-search__clear" onClick={() => setSearch("")}>
              <X size={10} strokeWidth={2.5} />
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
            <Table2 size={48} strokeWidth={1.4} />
          </div>
          <p className="tb-empty__title">No tables yet</p>
          <p className="tb-empty__sub">Add your first table and generate its QR code</p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={15} strokeWidth={2.5} /> Add Your First Table
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
