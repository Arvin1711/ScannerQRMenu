import { Chart } from "@highcharts/react";
import "highcharts/es-modules/masters/highcharts-more.src.js";

export default function OlympicMedalsChart({ data = { items: [], categories: [] }, orders = [] }) {
  const menuItems  = data.items.length;
  const ordersCount = orders.length;
  const categories = data.categories.length;

  const options = {
    chart: {
      type: "column",
      inverted: true,
      polar: true,
      height: 380,
      style: { fontSize: "11px" },
    },
    colors: ["#807ed5", "#20c55e", "#fb9559"],
    title: {
      text: "Restaurant Overview",
      style: { fontSize: "13px" },
    },
    subtitle: {
      text: "Menu Items · Orders · Categories",
      style: { fontSize: "10px" },
    },
    tooltip: {
      outside: true,
      style: { fontSize: "11px" },
      pointFormat: "<b>{point.y}</b> {series.name}",
    },
    legend: {
      itemStyle: { fontSize: "11px" },
    },
    pane: {
      size: "85%",
      innerSize: "20%",
      endAngle: 270,
    },
    xAxis: {
      tickInterval: 1,
      labels: {
        align: "right",
        allowOverlap: true,
        step: 1,
        y: 3,
        style: { fontSize: "10px" },
      },
      lineWidth: 0,
      gridLineWidth: 0,
      categories: ["Menu Items", "Orders", "Categories"],
    },
    yAxis: {
      lineWidth: 0,
      reversedStacks: false,
      endOnTick: true,
      showLastLabel: true,
      gridLineWidth: 0,
    },
    plotOptions: {
      column: {
        stacking: "normal",
        borderWidth: 0,
        pointPadding: 0,
        groupPadding: 0.15,
        borderRadius: { radius: "50%", where: "all" },
        dataLabels: {
          enabled: true,
          style: { fontSize: "11px", fontWeight: "700" },
        },
      },
    },
    series: [
      { name: "Menu Items",  data: [menuItems,   0,            0] },
      { name: "Orders",      data: [0,            ordersCount,  0] },
      { name: "Categories",  data: [0,            0,            categories] },
    ],
    responsive: {
      rules: [
        {
          condition: { maxWidth: 500 },
          chartOptions: {
            chart: { height: 260 },
            title: { style: { fontSize: "12px" } },
            subtitle: { style: { fontSize: "9px" } },
          },
        },
      ],
    },
    credits: { enabled: false },
  };

  return (
    <div className="ta-chart-card">
      <Chart options={options} />
    </div>
  );
}
