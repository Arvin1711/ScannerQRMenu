import { useState } from "react";
import { Button } from "./ui";

// ── Review card ──
function ReviewCard({ review, onToggle }) {
  const ts = review.timestamp;
  const date = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
  const dateStr = date
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "–";
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  return (
    <article className={`review-admin-card ${review.published ? "is-published" : ""}`}>
      <header className="review-admin-header">
        <span className="review-admin-stars" aria-label={`${review.rating || 0} out of 5 stars`}>
          {stars(review.rating || 0)}
        </span>
        {review.name && <span className="review-admin-name">{review.name}</span>}
        <time className="review-admin-date" dateTime={date?.toISOString()}>{dateStr}</time>
      </header>
      {review.text && <p className="review-admin-text">&ldquo;{review.text}&rdquo;</p>}
      {[["Food", review.food], ["Service", review.service], ["Atmosphere", review.atmosphere]].some(([, v]) => v > 0) && (
        <div className="review-admin-cats" aria-label="Category ratings">
          {[["Food", review.food], ["Service", review.service], ["Atmosphere", review.atmosphere]]
            .filter(([, v]) => v > 0)
            .map(([lbl, v]) => (
              <span key={lbl} className="review-admin-cat" aria-label={`${lbl}: ${v} out of 5`}>
                {lbl}: {stars(v)}
              </span>
            ))}
        </div>
      )}
      <footer className="review-publish">
        <Button
          variant={review.published ? "tertiary" : "primary"}
          size="sm"
          onClick={onToggle}
          aria-label={review.published ? `Unpublish review by ${review.name || "guest"}` : `Publish review by ${review.name || "guest"}`}
        >
          {review.published ? "Unpublish" : "Publish"}
        </Button>
      </footer>
    </article>
  );
}

// ── Analytics tab ──
export default function AnalyticsTab({ reviews, onTogglePublish }) {
  const [reviewFilter, setReviewFilter] = useState("all");
  const publishedCount = reviews.filter((r) => r.published).length;
  const pendingCount = reviews.filter((r) => !r.published).length;
  const visibleReviews =
    reviewFilter === "published" ? reviews.filter((r) => r.published)
    : reviewFilter === "pending" ? reviews.filter((r) => !r.published)
    : reviews;

  return (
    <section className="analytics-tab">
      <section className="reviews-management">
        <h3 className="reviews-mgmt-title">Customer Feedback</h3>
        <nav className="review-filter-tabs" aria-label="Filter reviews">
          {[
            ["all", `All (${reviews.length})`],
            ["unpublish", `Unpublish (${pendingCount})`],
            ["published", `Published (${publishedCount})`],
          ].map(([v, l]) => (
            <button
              key={v}
              className={`review-filter-btn ${reviewFilter === v ? "active" : ""}`}
              onClick={() => setReviewFilter(v)}
              aria-pressed={reviewFilter === v}
            >
              {l}
            </button>
          ))}
        </nav>
        {visibleReviews.length === 0 ? (
          <p className="reviews-empty" role="status">No reviews here yet</p>
        ) : (
          <ul className="reviews-list">
            {visibleReviews.map((r) => (
              <li key={r.id}>
                <ReviewCard review={r} onToggle={() => onTogglePublish(r.id, r.published)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
