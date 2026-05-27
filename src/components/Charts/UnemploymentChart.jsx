import { useState, useMemo } from "react";
import { Chart, Highcharts } from "@highcharts/react";

const colors = Highcharts.getOptions().colors;

const VIEWS = [
  { id: "daily",   label: "Daily" },
  { id: "weekly",  label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly",  label: "Yearly" },
];

function fmtAxis(v) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)   return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v}`;
}

function fmtFull(v) {
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

function getTs(o) {
  if (o.timestamp?.toDate) return o.timestamp.toDate();
  if (o.timestamp) return new Date(o.timestamp);
  return null;
}

function buildData(view, orders, now) {
  let categories = [];
  let buckets    = []; // { revenue, count }

  if (view === "daily") {
    categories = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    buckets    = Array.from({ length: 24 }, () => ({ revenue: 0, count: 0 }));
    orders.forEach((o) => {
      const t = getTs(o);
      if (t && t.toDateString() === now.toDateString()) {
        buckets[t.getHours()].revenue += o.total || 0;
        buckets[t.getHours()].count   += 1;
      }
    });
  } else if (view === "weekly") {
    categories = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
    });
    buckets = Array.from({ length: 7 }, () => ({ revenue: 0, count: 0 }));
    orders.forEach((o) => {
      const t = getTs(o);
      if (!t) return;
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        if (t.toDateString() === d.toDateString()) {
          buckets[i].revenue += o.total || 0;
          buckets[i].count   += 1;
        }
      }
    });
  } else if (view === "monthly") {
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    categories = Array.from({ length: days }, (_, i) => String(i + 1));
    buckets    = Array.from({ length: days }, () => ({ revenue: 0, count: 0 }));
    orders.forEach((o) => {
      const t = getTs(o);
      if (t && t.getMonth() === now.getMonth() && t.getFullYear() === now.getFullYear()) {
        buckets[t.getDate() - 1].revenue += o.total || 0;
        buckets[t.getDate() - 1].count   += 1;
      }
    });
  } else {
    categories = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    buckets    = Array.from({ length: 12 }, () => ({ revenue: 0, count: 0 }));
    orders.forEach((o) => {
      const t = getTs(o);
      if (t && t.getFullYear() === now.getFullYear()) {
        buckets[t.getMonth()].revenue += o.total || 0;
        buckets[t.getMonth()].count   += 1;
      }
    });
  }

  const revenue = buckets.map((b) => parseFloat(b.revenue.toFixed(2)));
  const count   = buckets.map((b) => b.count);
  const avg     = buckets.map((b) => b.count > 0 ? parseFloat((b.revenue / b.count).toFixed(2)) : 0);

  return { categories, revenue, count, avg };
}

export default function UnemploymentChart({ orders = [] }) {
  const [view, setView] = useState("monthly");
  const now = new Date();

  const { categories, revenue, count, avg } = useMemo(
    () => buildData(view, orders, now),
    [view, orders]
  );

  const options = {
    chart: {
      zooming: { type: "xy" },
      height: 380,
      style: { fontSize: "11px" },
    },
    title: {
      text: "Sales Overview",
      style: { fontSize: "13px" },
    },
    subtitle: {
      text: `${view.charAt(0).toUpperCase() + view.slice(1)} breakdown — Revenue · Orders · Avg Value`,
      style: { fontSize: "10px" },
    },
    xAxis: [
      {
        categories,
        crosshair: true,
        labels: { style: { fontSize: "10px" } },
      },
    ],
    yAxis: [
      {
        labels: {
          style: { color: colors[2], fontSize: "10px" },
          formatter() { return fmtAxis(this.value); },
        },
        title: {
          text: "Avg Order Value",
          style: { color: colors[2], fontSize: "10px" },
        },
        opposite: true,
      },
      {
        gridLineWidth: 0,
        title: {
          text: "Revenue",
          style: { color: colors[0], fontSize: "10px" },
        },
        labels: {
          style: { color: colors[0], fontSize: "10px" },
          formatter() { return fmtAxis(this.value); },
        },
      },
      {
        gridLineWidth: 0,
        title: {
          text: "Orders",
          style: { color: colors[1], fontSize: "10px" },
        },
        labels: {
          format: "{value}",
          style: { color: colors[1], fontSize: "10px" },
        },
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
      style: { fontSize: "11px" },
      formatter() {
        return this.points.map((p) => {
          if (p.series.name === "Order Count") {
            return `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${p.y} orders</b>`;
          }
          return `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${fmtFull(p.y)}</b>`;
        }).join("<br/>");
      },
    },
    legend: {
      layout: "vertical",
      align: "left",
      x: 80,
      verticalAlign: "top",
      y: 55,
      floating: true,
      backgroundColor:
        Highcharts.defaultOptions.legend.backgroundColor || "rgba(255,255,255,0.25)",
      itemStyle: { fontSize: "11px" },
    },
    series: [
      {
        name: "Revenue",
        type: "column",
        yAxis: 1,
        data: revenue,
      },
      {
        name: "Order Count",
        type: "spline",
        yAxis: 2,
        data: count,
        marker: { enabled: false },
        dashStyle: "shortdot",
        tooltip: { valueSuffix: " orders" },
      },
      {
        name: "Avg Order Value",
        type: "spline",
        data: avg,
      },
    ],
    responsive: {
      rules: [
        {
          condition: { maxWidth: 500 },
          chartOptions: {
            chart: { height: 280 },
            title: { style: { fontSize: "12px" } },
            subtitle: { style: { fontSize: "9px" } },
            legend: {
              floating: false,
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
              x: 0,
              y: 0,
            },
            yAxis: [
              { labels: { align: "right", x: 0, y: -6 }, showLastLabel: false },
              { labels: { align: "left",  x: 0, y: -6 }, showLastLabel: false },
              { visible: false },
            ],
          },
        },
      ],
    },
    credits: { enabled: false },
  };

  return (
    <div className="ta-chart-card">
      <div className="ta-chart-view-btns">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            className={`ta-chart-view-btn${view === v.id ? " ta-chart-view-btn--active" : ""}`}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <Chart options={options} />
    </div>
  );
}
