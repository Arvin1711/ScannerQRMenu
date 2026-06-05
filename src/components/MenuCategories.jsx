import { useState, useEffect } from "react";
import { Button } from "./ui";

export default function MenuCategories({ data, onPersist }) {
  const [search, setSearch] = useState("");
  const [catError, setCatError] = useState("");

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [addError, setAddError] = useState("");

  // Edit modal
  const [editCat, setEditCat] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState("");

  const cats = data.categories || [];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showAddModal) closeAddModal();
      if (editCat !== null) closeEditModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddModal, editCat]);

  const showError = (msg) => {
    setCatError(msg);
    setTimeout(() => setCatError(""), 3000);
  };

  // ── Add ──
  const openAddModal = () => {
    setNewCat("");
    setAddError("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewCat("");
    setAddError("");
  };

  const addCategory = (e) => {
    e?.preventDefault();
    const t = newCat.trim();
    if (!t) { setAddError("Please enter a category name."); return; }
    if (cats.includes(t)) { setAddError(`"${t}" already exists.`); return; }
    onPersist({ ...data, categories: [...cats, t] });
    closeAddModal();
  };

  // ── Edit ──
  const openEditModal = (cat) => {
    setEditCat(cat);
    setEditValue(cat);
    setEditError("");
  };

  const closeEditModal = () => {
    setEditCat(null);
    setEditValue("");
    setEditError("");
  };

  const saveEdit = (e) => {
    e?.preventDefault();
    const t = editValue.trim();
    if (!t) { setEditError("Category name cannot be empty."); return; }
    if (t === editCat) { closeEditModal(); return; }
    if (cats.includes(t)) { setEditError(`"${t}" already exists.`); return; }
    const newCats = cats.map((c) => (c === editCat ? t : c));
    const newItems = (data.items || []).map((i) =>
      i.category === editCat ? { ...i, category: t } : i
    );
    onPersist({ ...data, categories: newCats, items: newItems });
    closeEditModal();
  };

  // ── Delete ──
  const deleteCategory = (cat) => {
    if ((data.items || []).some((i) => i.category === cat)) {
      showError(`Move or delete all "${cat}" items first.`);
      return;
    }
    onPersist({ ...data, categories: cats.filter((c) => c !== cat) });
  };

  const filtered = cats.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="ta-section-wrap">
      <header className="categories-header">
        <h3 className="categories-title">Menu Categories</h3>

        <div className="categories-toolbar">
          <div className="categories-search-wrap">
            <svg className="cat-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="cat-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              aria-label="Search categories"
            />
            {search && (
              <button className="cat-search-clear" onClick={() => setSearch("")} aria-label="Clear search">×</button>
            )}
          </div>
          <Button variant="primary" size="md" onClick={openAddModal}>
            + Add Categories
          </Button>
        </div>

        {catError && <p className="cat-error" role="alert">{catError}</p>}
      </header>

      {filtered.length === 0 && (
        <p className="cat-empty">
          {search ? `No categories match "${search}".` : "No categories yet."}
        </p>
      )}

      <ul className="categories-list" aria-label="Categories">
        {filtered.map((cat) => {
          const count = (data.items || []).filter((i) => i.category === cat).length;
          const avail = (data.items || []).filter((i) => i.category === cat && i.available).length;
          return (
            <li key={cat} className="category-item">
              <div className="cat-info">
                <span className="cat-name">{cat}</span>
                <span className="cat-stats">{count} item{count !== 1 ? "s" : ""} · {avail} available</span>
              </div>
              <div className="cat-actions">
                <button className="cat-edit" onClick={() => openEditModal(cat)} aria-label={`Edit category ${cat}`}>
                  Edit
                </button>
                <button className="cat-remove" onClick={() => deleteCategory(cat)} aria-label={`Remove category ${cat}`}>
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* ── Add Category Modal ── */}
      {showAddModal && (
        <div className="cat-modal-overlay" onClick={closeAddModal}>
          <div className="cat-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="add-cat-title">
            <div className="cat-modal-header">
              <h4 id="add-cat-title">Add New Category</h4>
              <button className="cat-modal-close" onClick={closeAddModal} aria-label="Close">×</button>
            </div>
            <form className="cat-modal-body" onSubmit={addCategory}>
              <label className="cat-modal-label" htmlFor="new-cat-input">Category Name</label>
              <input
                id="new-cat-input"
                className="cat-modal-input"
                value={newCat}
                onChange={(e) => { setNewCat(e.target.value); setAddError(""); }}
                placeholder="e.g. Beverages"
                autoFocus
              />
              {addError && <p className="cat-modal-error">{addError}</p>}
              <div className="cat-modal-footer">
                <Button type="button" variant="secondary" size="md" onClick={closeAddModal}>Cancel</Button>
                <Button type="submit" variant="primary" size="md">Add Category</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Category Modal ── */}
      {editCat !== null && (
        <div className="cat-modal-overlay" onClick={closeEditModal}>
          <div className="cat-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="edit-cat-title">
            <div className="cat-modal-header">
              <h4 id="edit-cat-title">Edit Category</h4>
              <button className="cat-modal-close" onClick={closeEditModal} aria-label="Close">×</button>
            </div>
            <form className="cat-modal-body" onSubmit={saveEdit}>
              <label className="cat-modal-label" htmlFor="edit-cat-input">Category Name</label>
              <input
                id="edit-cat-input"
                className="cat-modal-input"
                value={editValue}
                onChange={(e) => { setEditValue(e.target.value); setEditError(""); }}
                autoFocus
              />
              {editError && <p className="cat-modal-error">{editError}</p>}
              <p className="cat-modal-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                All menu items in this category will be updated automatically.
              </p>
              <div className="cat-modal-footer">
                <Button type="button" variant="secondary" size="md" onClick={closeEditModal}>Cancel</Button>
                <Button type="submit" variant="primary" size="md">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
