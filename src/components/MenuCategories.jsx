import { useState } from "react";
import { Button } from "./ui";

export default function MenuCategories({ data, onPersist }) {
  const [newCat, setNewCat] = useState("");
  const [catError, setCatError] = useState("");

  const addCategory = (e) => {
    e?.preventDefault();
    const t = newCat.trim();
    if (!t || data.categories.includes(t)) return;
    onPersist({ ...data, categories: [...data.categories, t] });
    setNewCat("");
  };

  const deleteCategory = (cat) => {
    if (data.items.some((i) => i.category === cat)) {
      setCatError(`Move or delete all "${cat}" items first.`);
      setTimeout(() => setCatError(""), 3000);
      return;
    }
    onPersist({ ...data, categories: data.categories.filter((c) => c !== cat) });
  };

  return (
    <section className="ta-section-wrap">
      <header className="categories-header">
        <h3 className="categories-title">Menu Categories</h3>
        <form className="categories-add-form" onSubmit={addCategory} role="search" aria-label="Add category">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="New Category Name"
            aria-label="Category name"
          />
          <Button type="submit" variant="primary" size="md">+ Add Categories</Button>
        </form>
        {catError && (
          <p className="cat-error" role="alert">{catError}</p>
        )}
      </header>

      <ul className="categories-list" aria-label="Categories">
        {data.categories.map((cat) => {
          const count = data.items.filter((i) => i.category === cat).length;
          const avail = data.items.filter((i) => i.category === cat && i.available).length;
          return (
            <li key={cat} className="category-item">
              <div className="cat-info">
                <span className="cat-name">{cat}</span>
                <span className="cat-stats">{count} item{count !== 1 ? "s" : ""} · {avail} available</span>
              </div>
              <button
                className="cat-remove"
                onClick={() => deleteCategory(cat)}
                aria-label={`Remove category ${cat}`}
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
