import React, { useMemo, useState } from "react";

// Mock data for car rentals
const carRentals = [
  { carModel: "Toyota Vios", carType: "Sedan", hasAC: true, season: "Winter", rentalCost: 1200000, incomeRange: "15-25m", revenue: 4500000, rentals: 6 },
  { carModel: "Toyota Vios", carType: "Sedan", hasAC: true, season: "Summer", rentalCost: 1100000, incomeRange: "10-15m", revenue: 3100000, rentals: 5 },
  { carModel: "Ford Transit", carType: "Van", hasAC: true, season: "Winter", rentalCost: 1800000, incomeRange: "25-40m", revenue: 6200000, rentals: 5 },
  { carModel: "Kia Morning", carType: "Hatchback", hasAC: false, season: "Spring", rentalCost: 800000, incomeRange: "8-12m", revenue: 2400000, rentals: 4 },
  { carModel: "Hyundai Solati", carType: "Van", hasAC: true, season: "Summer", rentalCost: 1900000, incomeRange: "25-40m", revenue: 5700000, rentals: 4 },
  { carModel: "Mazda CX-5", carType: "SUV", hasAC: true, season: "Winter", rentalCost: 2000000, incomeRange: "25-40m", revenue: 6800000, rentals: 4 },
  { carModel: "Mazda CX-5", carType: "SUV", hasAC: true, season: "Autumn", rentalCost: 1950000, incomeRange: "15-25m", revenue: 3900000, rentals: 2 },
  { carModel: "Isuzu D-Max", carType: "Pickup", hasAC: false, season: "Autumn", rentalCost: 1300000, incomeRange: "10-15m", revenue: 2600000, rentals: 2 },
];

// Mock data for package tours
const packageTours = [
  { code: "DN-3N2D", packageDuration: "3D2N", packageType: "Beach", packageCost: 12000000, incomeRange: "15-25m", groupType: "Family", season: "Winter", revenue: 12000000, bookings: 18 },
  { code: "PQ-4N3D", packageDuration: "4D3N", packageType: "Resort", packageCost: 15500000, incomeRange: "25-40m", groupType: "Couple", season: "Winter", revenue: 15500000, bookings: 22 },
  { code: "DL-2N1D", packageDuration: "2D1N", packageType: "Mountain", packageCost: 6500000, incomeRange: "10-15m", groupType: "Friends", season: "Winter", revenue: 6500000, bookings: 12 },
  { code: "HN-1D", packageDuration: "1D", packageType: "City", packageCost: 4200000, incomeRange: "8-12m", groupType: "Solo", season: "Spring", revenue: 4200000, bookings: 9 },
  { code: "SG-1D", packageDuration: "1D", packageType: "City", packageCost: 5100000, incomeRange: "12-18m", groupType: "Corporate", season: "Summer", revenue: 5100000, bookings: 11 },
  { code: "HUE-3N2D", packageDuration: "3D2N", packageType: "Heritage", packageCost: 9800000, incomeRange: "15-25m", groupType: "Family", season: "Autumn", revenue: 9800000, bookings: 10 },
];

const costBucket = (value) => {
  if (value < 900000) return "< 0.9m";
  if (value < 1200000) return "0.9m - 1.2m";
  if (value < 1500000) return "1.2m - 1.5m";
  if (value < 2000000) return "1.5m - 2.0m";
  return ">= 2.0m";
};

const tourCostBucket = (value) => {
  if (value < 5000000) return "< 5m";
  if (value < 8000000) return "5m - 8m";
  if (value < 12000000) return "8m - 12m";
  if (value < 16000000) return "12m - 16m";
  return ">= 16m";
};

const aggregate = (list, key, valueKey = "revenue") => {
  const map = {};
  list.forEach((i) => {
    const k = i[key] ?? "Unknown";
    map[k] = map[k] || { label: k, value: 0 };
    map[k].value += i[valueKey] || 0;
  });
  return Object.values(map).sort((a, b) => b.value - a.value);
};

export default function Dashboard() {
  const [openPanels, setOpenPanels] = useState({
    carModel: true,
    carType: true,
    carIncome: true,
    carCost: true,
    carAC: true,
    carSeason: true,
    tourDuration: true,
    tourType: true,
    tourCost: true,
    tourIncome: true,
    tourGroup: true,
    tourSeason: true,
  });

  const toggle = (key) => setOpenPanels((p) => ({ ...p, [key]: !p[key] }));
  // Revenue sums
  const tourRevenue = useMemo(() => packageTours.reduce((s, t) => s + t.revenue, 0), []);
  const carRevenue = useMemo(() => carRentals.reduce((s, c) => s + c.revenue, 0), []);

  const tourStats = useMemo(() => ({
    revenue: tourRevenue,
    bookings: packageTours.reduce((s, t) => s + t.bookings, 0),
    count: packageTours.length,
  }), [tourRevenue]);

  const carStats = useMemo(() => ({
    revenue: carRevenue,
    rentals: carRentals.reduce((s, c) => s + c.rentals, 0),
    count: carRentals.length,
  }), [carRevenue]);

  // Car analytics
  const carByModel = useMemo(() => aggregate(carRentals, "carModel"), []);
  const carByType = useMemo(() => aggregate(carRentals, "carType"), []);
  const carByAC = useMemo(() => aggregate(carRentals, "hasAC"), []);
  const carBySeason = useMemo(() => aggregate(carRentals, "season"), []);
  const carByIncome = useMemo(() => aggregate(carRentals, "incomeRange"), []);
  const carByCost = useMemo(() => aggregate(carRentals.map((c) => ({ ...c, bucket: costBucket(c.rentalCost) })), "bucket"), []);

  // Tour analytics
  const tourByDuration = useMemo(() => aggregate(packageTours, "packageDuration"), []);
  const tourByType = useMemo(() => aggregate(packageTours, "packageType"), []);
  const tourBySeason = useMemo(() => aggregate(packageTours, "season"), []);
  const tourByIncome = useMemo(() => aggregate(packageTours, "incomeRange"), []);
  const tourByGroup = useMemo(() => aggregate(packageTours, "groupType"), []);
  const tourByCost = useMemo(() => aggregate(packageTours.map((t) => ({ ...t, bucket: tourCostBucket(t.packageCost) })), "bucket"), []);

  const handleExportPdf = () => window.print();

  return (
    <div className="space-y-8 pb-12">
      <header className="pt-6">
        <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Staff Dashboard</h1>
            <p className="opacity-90 text-sm">
              Revenue analysis (mock) for car rentals and package tours.
            </p>
          </div>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-white text-primary-700 rounded-lg font-semibold shadow-md hover:bg-primary-50 transition"
          >
            Export PDF (Print)
          </button>
        </div>
      </header>

      {/* Quick Toggle Menu */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold text-neutral-800">Toggle Display Content</h3>
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            { key: "carModel", label: "Car - Model" },
            { key: "carType", label: "Car - Type" },
            { key: "carIncome", label: "Car - Customer Income" },
            { key: "carCost", label: "Car - Price Range" },
            { key: "carAC", label: "Car - AC" },
            { key: "carSeason", label: "Car - Season" },
            { key: "tourDuration", label: "Tour - Duration" },
            { key: "tourType", label: "Tour - Type" },
            { key: "tourCost", label: "Tour - Price Range" },
            { key: "tourIncome", label: "Tour - Customer Income" },
            { key: "tourGroup", label: "Tour - Group Type" },
            { key: "tourSeason", label: "Tour - Season" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => toggle(item.key)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition ${
                openPanels[item.key]
                  ? "bg-primary-50 border-primary-300 text-primary-700 font-medium"
                  : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-200"
              }`}
            >
              {openPanels[item.key] ? "Hide" : "Show"} {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng doanh thu" value={tourRevenue + carRevenue} accent />
        <StatCard label="Doanh thu tour" value={tourRevenue} />
        <StatCard label="Doanh thu thuê xe" value={carRevenue} />
        <StatCard label="Lượt đặt tour" value={tourStats.bookings} />
        <StatCard label="Số tour" value={tourStats.count} />
        <StatCard label="Lượt thuê xe" value={carStats.rentals} />
      </div>

      {/* Car analytics */}
      <Section title="Car Rental Revenue Analysis">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="By Car Model" open={openPanels.carModel} onToggle={() => toggle("carModel")}>
            <BarList data={carByModel} total={carRevenue} color="bg-primary-500" />
          </Panel>
          <Panel title="By Car Type" open={openPanels.carType} onToggle={() => toggle("carType")}>
            <BarList data={carByType} total={carRevenue} color="bg-primary-600" />
          </Panel>
          <Panel title="By Customer Income" open={openPanels.carIncome} onToggle={() => toggle("carIncome")}>
            <BarList data={carByIncome} total={carRevenue} color="bg-accent-500" />
          </Panel>
          <Panel title="By Price Range" open={openPanels.carCost} onToggle={() => toggle("carCost")}>
            <BarList data={carByCost} total={carRevenue} color="bg-primary-400" />
          </Panel>
          <Panel title="AC / Non-AC" open={openPanels.carAC} onToggle={() => toggle("carAC")}>
            <BarList
              data={carByAC.map((d) => ({ ...d, label: d.label === true ? "Air-conditioned" : "Non AC" }))}
              total={carRevenue}
              color="bg-accent-600"
            />
          </Panel>
          <Panel title="By Season" open={openPanels.carSeason} onToggle={() => toggle("carSeason")}>
            <BarList data={carBySeason} total={carRevenue} color="bg-primary-500" />
          </Panel>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Pie Chart: Revenue by Car Type">
            <PieChart data={carByType} colors={["#F97316", "#EA580C", "#F59E0B", "#D97706", "#C2410C"]} />
          </Panel>
          <Panel title="Column Chart: Revenue by Season (Cars)">
            <ColumnChart data={carBySeason} color="#F97316" />
          </Panel>
          <Panel title="Area Chart: Revenue by Income (Cars)">
            <AreaChart data={carByIncome} color="#EA580C" />
          </Panel>
        </div>
      </Section>

      {/* Tour analytics */}
      <Section title="Package Tour Revenue Analysis">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="By Duration" open={openPanels.tourDuration} onToggle={() => toggle("tourDuration")}>
            <BarList data={tourByDuration} total={tourRevenue} color="bg-primary-500" />
          </Panel>
          <Panel title="By Tour Type" open={openPanels.tourType} onToggle={() => toggle("tourType")}>
            <BarList data={tourByType} total={tourRevenue} color="bg-primary-600" />
          </Panel>
          <Panel title="By Price Range" open={openPanels.tourCost} onToggle={() => toggle("tourCost")}>
            <BarList data={tourByCost} total={tourRevenue} color="bg-accent-500" />
          </Panel>
          <Panel title="By Customer Income" open={openPanels.tourIncome} onToggle={() => toggle("tourIncome")}>
            <BarList data={tourByIncome} total={tourRevenue} color="bg-primary-400" />
          </Panel>
          <Panel title="By Group Type" open={openPanels.tourGroup} onToggle={() => toggle("tourGroup")}>
            <BarList data={tourByGroup} total={tourRevenue} color="bg-accent-600" />
          </Panel>
          <Panel title="By Season" open={openPanels.tourSeason} onToggle={() => toggle("tourSeason")}>
            <BarList data={tourBySeason} total={tourRevenue} color="bg-primary-500" />
          </Panel>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Pie Chart: Revenue by Tour Type">
            <PieChart data={tourByType} colors={["#F97316", "#EA580C", "#F59E0B", "#D97706", "#C2410C"]} />
          </Panel>
          <Panel title="Column Chart: Revenue by Season (Tours)">
            <ColumnChart data={tourBySeason} color="#F97316" />
          </Panel>
          <Panel title="Area Chart: Revenue by Income (Tours)">
            <AreaChart data={tourByIncome} color="#EA580C" />
          </Panel>
        </div>
      </Section>

      {/* Recent items */}
          <Panel title="Recent Tours (mock)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-50 text-neutral-700 border-b border-primary-200">
              <tr>
                {["Code", "Type", "Duration", "Season", "Group Type", "Bookings", "Revenue"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packageTours.map((t) => (
                <tr key={t.code} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                  <td className="px-4 py-3 font-semibold text-neutral-900">{t.code}</td>
                  <td className="px-4 py-3 text-neutral-700">{t.packageType}</td>
                  <td className="px-4 py-3 text-neutral-700">{t.packageDuration}</td>
                  <td className="px-4 py-3 text-neutral-700">{t.season}</td>
                  <td className="px-4 py-3 text-neutral-700">{t.groupType}</td>
                  <td className="px-4 py-3 text-neutral-700">{t.bookings}</td>
                  <td className="px-4 py-3 text-primary-600 font-bold">
                    {t.revenue.toLocaleString()} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Recent Car Rentals (mock)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-50 text-neutral-700 border-b border-primary-200">
              <tr>
                {["Car Model", "Car Type", "AC", "Season", "Income Range", "Rentals", "Revenue"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {carRentals.map((c, idx) => (
                <tr key={`${c.carModel}-${idx}`} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                  <td className="px-4 py-3 font-semibold text-neutral-900">{c.carModel}</td>
                  <td className="px-4 py-3 text-neutral-700">{c.carType}</td>
                  <td className="px-4 py-3 text-neutral-700">{c.hasAC ? "AC" : "Non AC"}</td>
                  <td className="px-4 py-3 text-neutral-700">{c.season}</td>
                  <td className="px-4 py-3 text-neutral-700">{c.incomeRange}</td>
                  <td className="px-4 py-3 text-neutral-700">{c.rentals}</td>
                  <td className="px-4 py-3 text-primary-600 font-bold">
                    {c.revenue.toLocaleString()} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs text-neutral-600 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-2 ${accent ? "text-primary-600" : "text-neutral-900"}`}>
        {value.toLocaleString()} {label.toLowerCase().includes("revenue") ? "đ" : ""}
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-neutral-900 border-b border-primary-200 pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Panel({ title, children, open = true, onToggle }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        {onToggle && (
          <button
            className="text-xs px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 text-neutral-700 font-medium transition"
            onClick={onToggle}
          >
            {open ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {open && children}
    </div>
  );
}

function BarList({ data, total, color }) {
  return (
    <div className="space-y-2">
      {data.map((d) => {
        const pct = total ? Math.min(100, Math.round((d.value / total) * 100)) : 0;
        return (
          <div key={d.label}>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{d.label}</span>
              <span className="text-gray-600">{d.value.toLocaleString()} đ</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-1 overflow-hidden">
              <div className={`${color} h-2`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      {data.length === 0 && <p className="text-xs text-gray-500">No data</p>}
    </div>
  );
}

function PieChart({ data, colors }) {
  const sum = data.reduce((s, d) => s + d.value, 0) || 1;
  let start = 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 200 200">
        {data.map((d, i) => {
          const pct = d.value / sum;
          const len = pct * circumference;
          const circle = (
            <circle
              key={d.label}
              r={radius}
              cx="100"
              cy="100"
              fill="transparent"
              stroke={colors[i % colors.length]}
              strokeWidth="22"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-start}
            />
          );
          start += len;
          return circle;
        })}
        <circle r="40" cx="100" cy="100" fill="#fff" />
      </svg>
      <div className="ml-4 space-y-1 text-xs">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ background: colors[i % colors.length] }} />
            <span className="font-semibold">{d.label}</span>
            <span className="text-gray-600">{d.value.toLocaleString()} đ</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColumnChart({ data, color }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d) => {
        const pct = Math.max(6, (d.value / max) * 100);
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center">
            <div
              className="w-full rounded-t-md"
              style={{ height: `${pct}%`, background: color, minHeight: "18px" }}
              title={`${d.label}: ${d.value.toLocaleString()} đ`}
            />
            <div className="text-[11px] text-center text-gray-600 mt-1 truncate w-full">
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AreaChart({ data, color }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * 100;
    const y = 100 - (d.value / max) * 100;
    return `${x},${y}`;
  });
  const path = points.length
    ? `M ${points[0]} L ${points.slice(1).join(" ")} L 100,100 L 0,100 Z`
    : "";
  return (
    <div className="h-36 w-full bg-gray-50 border rounded-lg p-3">
      {points.length ? (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d={path} fill={color + "33"} stroke={color} strokeWidth="1.5" />
        </svg>
      ) : (
        <p className="text-xs text-gray-500">No data</p>
      )}
      <div className="flex justify-between text-[11px] text-gray-500 mt-1">
        {data.map((d) => (
          <span key={d.label} className="truncate">{d.label}</span>
        ))}
      </div>
    </div>
  );
}