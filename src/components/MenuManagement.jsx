import { useState, useMemo, useRef } from "react";
import { Button } from "./ui";

function genId() {
  return Date.now() + Math.floor(Math.random() * 9999);
}

const SPICE_LABELS = ["None", "Mild", "Medium", "Hot"];

function ItemModal({ item, categories, onSave, onClose }) {
  const [f, setF] = useState(
    item || {
      name: "",
      desc: "",
      price: "",
      category: categories[0] || "",
      available: true,
      veg: null,
      tag: null,
      spice: 0,
      image: "",
    }
  );
  const [imgMode, setImgMode] = useState("upload");
  const [uploadErr, setUploadErr] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const isEdit = !!item;

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid =
    f.name.trim() && String(f.price).trim() && !isNaN(parseFloat(f.price));

  const processFile = (file) => {
    setUploadErr("");
    if (!file.type.startsWith("image/")) {
      setUploadErr("Please select an image file.");
      return;
    }
    if (file.size > 1.2 * 1024 * 1024) {
      setUploadErr("File too large — max 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => set("image", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);

  return (
    <div className="modal-content">
      <h2>{isEdit ? "Edit item" : "Add menu item"}</h2>
      <div className="form-group">
        <div className="form-field">
          <label>Item name *</label>
          <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Margherita Pizza" />
        </div>
        <div className="form-field">
          <label>Description</label>
          <input value={f.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Ingredients, allergens…" />
        </div>
        <div className="form-field">
          <label>Dish Image</label>
          <div className="img-mode-tabs">
            <button type="button" className={imgMode === "upload" ? "active" : ""} onClick={() => setImgMode("upload")}>Upload</button>
            <button type="button" className={imgMode === "url" ? "active" : ""} onClick={() => setImgMode("url")}>Paste URL</button>
          </div>
          {imgMode === "upload" ? (
            <>
              <div
                className={`img-upload-area ${f.image ? "has-image" : ""} ${dragging ? "dragging" : ""}`}
                onClick={() => !f.image && fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {f.image ? (
                  <>
                    <img src={f.image} alt="Preview" className="img-upload-preview" />
                    <div className="img-upload-change">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>Change photo</span>
                    </div>
                    <button type="button" className="img-remove-btn" onClick={(e) => { e.stopPropagation(); set("image", ""); }}>×</button>
                  </>
                ) : (
                  <div className="img-upload-placeholder">
                    <div className="upload-img-icon">
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <rect x="4" y="4" width="56" height="56" rx="10" fill="#dbeafe"/>
                        <circle cx="22" cy="22" r="7" fill="#3b82f6"/>
                        <path d="M4 44 L20 28 L34 42 L44 32 L60 48 L60 60 L4 60 Z" fill="#60a5fa"/>
                      </svg>
                    </div>
                    <p className="upload-main-text">Drop your image here, or{" "}
                      <span className="upload-browse-link" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>browse</span>
                    </p>
                    <p className="upload-sub-text">Supports: JPG, PNG, WebP · max 1 MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
              </div>
              {uploadErr && (
                <p className="img-upload-err">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                  {uploadErr}
                </p>
              )}
            </>
          ) : (
            <>
              <input value={f.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." />
              {f.image && (
                <img src={f.image} alt="Preview" className="image-preview"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  onLoad={(e) => { e.currentTarget.style.display = "block"; }}
                />
              )}
            </>
          )}
        </div>
        <div className="form-row">
          <div className="form-field half">
            <label>Price (₹) *</label>
            <input type="number" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="0" min="0" step="10" />
          </div>
          <div className="form-field half">
            <label>Category</label>
            <select value={f.category} onChange={(e) => set("category", e.target.value)}>
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field half">
            <label>Special tag</label>
            <select value={f.tag || ""} onChange={(e) => set("tag", e.target.value || null)}>
              <option value="">None</option>
              <option value="new">New</option>
              <option value="popular">Popular</option>
              <option value="chef">Chef's Special</option>
            </select>
          </div>
          <div className="form-field half">
            <label>Spice level</label>
            <div className="spice-select">
              {SPICE_LABELS.map((label, level) => (
                <button key={level} type="button" className={f.spice === level ? "active" : ""} onClick={() => set("spice", level)}>
                  {level === 0 ? "—" : "🌶️".repeat(level)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="form-checkbox">
          <label>Diet type</label>
          <div className="diet-segment">
            <button type="button" onClick={() => set("veg", null)} className={f.veg === null ? "seg-active" : ""}>—</button>
            <button type="button" onClick={() => set("veg", true)} className={f.veg === true ? "seg-active seg-veg" : ""}>
              <span className="dot dot-veg" /> Veg
            </button>
            <button type="button" onClick={() => set("veg", false)} className={f.veg === false ? "seg-active seg-nonveg" : ""}>
              <span className="dot dot-nonveg" /> Non-veg
            </button>
          </div>
        </div>
        <div className="form-checkbox">
          <label>Available to order</label>
          <button onClick={() => set("available", !f.available)} className={f.available ? "checked" : "unchecked"}>
            {f.available ? "Yes" : "No"}
          </button>
        </div>
      </div>
      <div className="form-actions">
        <Button variant="tertiary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => valid && onSave(f)} disabled={!valid}>
          {isEdit ? "Save changes" : "Add item"}
        </Button>
      </div>
    </div>
  );
}

export default function MenuManagement({ data, onPersist }) {
  const [filterCat, setFilterCat] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState(null);

  const filteredItems = useMemo(() => {
    let items =
      filterCat === "All" ? data.items : data.items.filter((i) => i.category === filterCat);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
      );
    }
    return items;
  }, [data.items, filterCat, searchQuery]);

  const saveItem = (form) => {
    const price = parseFloat(form.price);
    const newItems =
      modal.type === "add"
        ? [...data.items, { ...form, price, id: genId() }]
        : data.items.map((i) => (i.id === form.id ? { ...form, price } : i));
    onPersist({ ...data, items: newItems });
    setModal(null);
  };

  const deleteItem = (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    onPersist({ ...data, items: data.items.filter((i) => i.id !== id) });
  };

  const toggleAvail = (id) =>
    onPersist({
      ...data,
      items: data.items.map((i) => (i.id === id ? { ...i, available: !i.available } : i)),
    });

  return (
    <>
      <section className="ta-section-wrap">
        <header className="items-header">
          <h3 className="items-title">Menu Management</h3>
          <nav className="chips-group" aria-label="Filter by category">
            {["All", ...data.categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`category-chip ${filterCat === cat ? "active" : ""}`}
                aria-pressed={filterCat === cat}
              >
                {cat}
              </button>
            ))}
          </nav>
          
        </header>

        <div role="search" className="items-search-wrap">
          <input
            className="items-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name or description…"
            aria-label="Search menu items"
          />
          <Button variant="primary" size="md" onClick={() => setModal({ type: "add" })}>+ Add item</Button>
        </div>

        {filteredItems.length === 0 ? (
          <p className="items-empty" role="status">No items found.</p>
        ) : (
          <ul className="items-list" aria-label="Menu items">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <article className={`item-row ${item.available ? "" : "unavailable"}`}>
                  <div className="item-info">
                    <div className="item-name-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-tag category-tag">{item.category}</span>
                      {!item.available && <span className="item-tag unavailable-tag">Unavailable</span>}
                    </div>
                    {item.desc && <p className="item-desc">{item.desc}</p>}
                  </div>
                  <span className="item-price" aria-label={`Price: ₹${item.price.toFixed(0)}`}>₹{item.price.toFixed(0)}</span>
                  <div className="item-actions">
                    {item.veg != null && (
                      <span className={`item-diet-badge ${item.veg ? "veg" : "nonveg"}`} aria-label={item.veg ? "Veg" : "Non-veg"}>
                        <span className="diet-dot-inner" aria-hidden="true" />
                      </span>
                    )}
                    <button
                      onClick={() => toggleAvail(item.id)}
                      className={item.available ? "toggle-on" : ""}
                      aria-label={item.available ? `Mark ${item.name} as unavailable` : `Mark ${item.name} as available`}
                    >
                      {item.available ? "On" : "Off"}
                    </button>
                    <button onClick={() => setModal({ type: "edit", item })} aria-label={`Edit ${item.name}`}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteItem(item.id, item.name)} aria-label={`Delete ${item.name}`}>Delete</button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={modal.type === "edit" ? "Edit item" : "Add menu item"}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <ItemModal
            item={modal.type === "edit" ? modal.item : null}
            categories={data.categories}
            onSave={saveItem}
            onClose={() => setModal(null)}
          />
        </div>
      )}
    </>
  );
}
