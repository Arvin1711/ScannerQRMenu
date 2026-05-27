import { useMemo } from "react";
import { UnemploymentChart, OlympicMedalsChart, NuclearStockpileChart } from "./Charts";
import { Button } from "./ui";
import { Currency, Eye, Layers2, SendToBack, SquareMenu, SquarePen } from "lucide-react";

export default function DashboardHome({ orders, data, reviews, onEditInfo, onPreview }) {
  const now = new Date();

  const thisMonth = useMemo(
    () =>
      orders.filter((o) => {
        const t = o.timestamp?.toDate
          ? o.timestamp.toDate()
          : o.timestamp
          ? new Date(o.timestamp)
          : null;
        return t && t.getMonth() === now.getMonth() && t.getFullYear() === now.getFullYear();
      }),
    [orders]
  );

  const lastMonth = useMemo(
    () =>
      orders.filter((o) => {
        const t = o.timestamp?.toDate
          ? o.timestamp.toDate()
          : o.timestamp
          ? new Date(o.timestamp)
          : null;
        if (!t) return false;
        const lm = new Date(now.getFullYear(), now.getMonth() - 1);
        return t.getMonth() === lm.getMonth() && t.getFullYear() === lm.getFullYear();
      }),
    [orders]
  );

  const today = useMemo(
    () =>
      orders.filter((o) => {
        const t = o.timestamp?.toDate
          ? o.timestamp.toDate()
          : o.timestamp
          ? new Date(o.timestamp)
          : null;
        return t && t.toDateString() === now.toDateString();
      }),
    [orders]
  );

  const menuItemCount = data.items.length;
  const availCount = data.items.filter((i) => i.available).length;
  const itemChangePct =
    menuItemCount > 0 ? ((availCount / menuItemCount) * 100).toFixed(2) : "0.00";
  const categoryCount = data.categories.length;

  const totalOrders = orders.length;
  const thisMonthOrders = thisMonth.length;
  const lastMonthOrders = lastMonth.length;
  const orderChangePct =
    lastMonthOrders > 0
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 0;

  const thisMonthRev = thisMonth.reduce((s, o) => s + (o.total || 0), 0);
  const lastMonthRev = lastMonth.reduce((s, o) => s + (o.total || 0), 0);
  const revChangePct =
    lastMonthRev > 0
      ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100
      : 0;

  const fmtRev = (v) =>
    v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${Math.round(v)}`;

  return (
    <div className="ta-dashboard">
      {/* Dashboard header */}
      <header className="ta-dash-header">
        <div className="ta-dash-header__left">
          <h1 className="ta-dash-header__title">Dashboard</h1>
          <p className="ta-dash-header__sub">Welcome back, {(data.name || "Admin").split(" ")[0]}</p>
        </div>
        <div className="ta-dash-header__right">
          <Button variant="secondary" size="md" onClick={onEditInfo} title="Edit restaurant info">
           <SquarePen size={16} />
            Edit info
          </Button>
          <Button variant="primary" size="md" onClick={onPreview}>
            <Eye size={16} />
            Preview Menu
          </Button>
        </div>
      </header>

      {/* Stat cards */}
      <div className="ta-row ta-row--top">
        <div className="ta-stat-cards">
          <div className="ta-stat-card">
            <div className="ta-stat-card__icon ta-stat-card__icon--blue" aria-hidden="true">
              <SquareMenu size={22} />
            </div>
            <div className="ta-stat-card__body">
              <p className="ta-stat-card__label">Menu Items</p>
              <div className="ta-stat-card__row">
                <span className="ta-stat-card__value">{menuItemCount.toLocaleString()}</span>
                {/* <span className="ta-stat-card__change ta-stat-card__change--up" aria-label={`${itemChangePct}% available`}>
                  ↑ {itemChangePct}%
                </span> */}
              </div>
            </div>
          </div>

          <div className="ta-stat-card">
            <div className="ta-stat-card__icon ta-stat-card__icon--orange" aria-hidden="true">
              <SendToBack size={22} />
            </div>
            <div className="ta-stat-card__body">
              <p className="ta-stat-card__label">Orders</p>
              <div className="ta-stat-card__row">
                <span className="ta-stat-card__value">{totalOrders.toLocaleString()}</span>
                {/* <span
                  className={`ta-stat-card__change ${orderChangePct >= 0 ? "ta-stat-card__change--up" : "ta-stat-card__change--down"}`}
                  aria-label={`${Math.abs(orderChangePct).toFixed(2)}% ${orderChangePct >= 0 ? "increase" : "decrease"} vs last month`}
                >
                  {orderChangePct >= 0 ? "↑" : "↓"} {Math.abs(orderChangePct).toFixed(2)}%
                </span> */}
              </div>
            </div>
          </div>

          <div className="ta-stat-card">
            <div className="ta-stat-card__icon ta-stat-card__icon--purple" aria-hidden="true">
              <Layers2 size={22} />
            </div>
            <div className="ta-stat-card__body">
              <p className="ta-stat-card__label">Categories</p>
              <div className="ta-stat-card__row">
                <span className="ta-stat-card__value">{categoryCount}</span>
                {/* <span className="ta-stat-card__change ta-stat-card__change--up" aria-label={`${availCount} of ${menuItemCount} items available`}>
                  {availCount}/{menuItemCount} avail
                </span> */}
              </div>
            </div>
          </div>

          <div className="ta-stat-card">
            <div className="ta-stat-card__icon ta-stat-card__icon--green" aria-hidden="true">
              <Currency size={22} />
            </div>
            <div className="ta-stat-card__body">
              <p className="ta-stat-card__label">Revenue</p>
              <div className="ta-stat-card__row">
                <span className="ta-stat-card__value">{fmtRev(thisMonthRev)}</span>
                {/* <span
                  className={`ta-stat-card__change ${revChangePct >= 0 ? "ta-stat-card__change--up" : "ta-stat-card__change--down"}`}
                  aria-label={`${Math.abs(revChangePct).toFixed(1)}% ${revChangePct >= 0 ? "increase" : "decrease"} vs last month`}
                >
                  {revChangePct >= 0 ? "↑" : "↓"} {Math.abs(revChangePct).toFixed(1)}%
                </span> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ta-row ta-row--charts">
        <OlympicMedalsChart data={data} orders={orders} />
        <NuclearStockpileChart />
      </div>
      <UnemploymentChart orders={orders} />
    </div>
  );
}
