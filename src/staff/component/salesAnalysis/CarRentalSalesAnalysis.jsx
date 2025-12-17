import React, { useState, useEffect, useMemo } from "react";
import { analyzeCarRentalSales } from "../../../services/staff/salesAnalysisStaffService";

// Exchange rate: 1 USD = 25,000 VND
const VND_TO_USD_RATE = 25000;

// Convert VND to USD
const vndToUsd = (vnd) => {
  return vnd / VND_TO_USD_RATE;
};

// Format USD currency
const formatUSD = (amount) => {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function CarRentalSalesAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [carID, setCarID] = useState("");

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (carID) params.carID = Number(carID);

      const result = await analyzeCarRentalSales(params);
      setData(result);
    } catch (err) {
      console.error("Failed to load sales analysis", err);
      if (err.response?.status === 403) {
        setError("Access denied. You need STAFF role to access this page.");
      } else {
        setError(err?.response?.data?.error || err.message || "Load failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Set default date range (last 30 days) and load initial data
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const endDateStr = today.toISOString().split("T")[0];
    const startDateStr = thirtyDaysAgo.toISOString().split("T")[0];

    setEndDate(endDateStr);
    setStartDate(startDateStr);

    // Load initial data
    const loadInitial = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await analyzeCarRentalSales({
          startDate: startDateStr,
          endDate: endDateStr,
        });
        setData(result);
      } catch (err) {
        console.error("Failed to load sales analysis", err);
        if (err.response?.status === 403) {
          setError("Access denied. You need STAFF role to access this page.");
        } else {
          setError(err?.response?.data?.error || err.message || "Load failed");
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert data for charts
  const chartData = useMemo(() => {
    if (!data) return null;

    return {
      revenueByPaymentMethod: (data.revenueByPaymentMethod || []).map((d) => ({
        label: d.label,
        value: vndToUsd(Number(d.revenue || 0)),
      })),
      revenueByPaymentStatus: (data.revenueByPaymentStatus || []).map((d) => ({
        label: d.label,
        value: vndToUsd(Number(d.revenue || 0)),
      })),
      revenueByOrderStatus: (data.revenueByOrderStatus || []).map((d) => ({
        label: d.label,
        value: vndToUsd(Number(d.revenue || 0)),
      })),
      bookingsByPaymentMethod: (data.bookingsByPaymentMethod || []).map(
        (d) => ({
          label: d.label,
          value: d.count || 0,
        })
      ),
      revenueByDate: (data.revenueByDate || []).map((d) => ({
        ...d,
        revenue: vndToUsd(Number(d.revenue || 0)),
      })),
      revenueByMonth: (data.revenueByMonth || []).map((d) => ({
        ...d,
        revenue: vndToUsd(Number(d.revenue || 0)),
      })),
      topCars: (data.topToursByRevenue || []).map((car) => ({
        ...car,
        revenue: vndToUsd(Number(car.revenue || 0)),
        averageOrderValue: car.averageOrderValue
          ? vndToUsd(Number(car.averageOrderValue))
          : null,
      })),
    };
  }, [data]);

  const totalRevenue = data ? vndToUsd(Number(data.totalRevenue || 0)) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">
          Car Rental Sales Analysis
        </h2>
        <p className="text-sm text-neutral-600 mt-1">
          Analyze car rental sales performance and revenue trends
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Car ID (Optional)
            </label>
            <input
              type="number"
              value={carID}
              onChange={(e) => setCarID(e.target.value)}
              placeholder="Filter by car"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadData}
              disabled={loading}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium text-sm disabled:opacity-50"
            >
              {loading ? "Loading..." : "Apply Filters"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="text-center py-12 text-neutral-500">
          Loading analysis...
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={totalRevenue} accent />
            <StatCard
              label="Paid Revenue"
              value={vndToUsd(Number(data.paidRevenue || 0))}
            />
            <StatCard label="Total Rentals" value={data.totalBookings || 0} />
            <StatCard label="Paid Rentals" value={data.paidBookings || 0} />
          </div>

          {/* Revenue by Payment Method */}
          <Section title="Revenue Analysis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel title="Revenue by Payment Method">
                {chartData?.revenueByPaymentMethod?.length > 0 ? (
                  <>
                    <BarList
                      data={chartData.revenueByPaymentMethod}
                      total={totalRevenue}
                      color="bg-primary-500"
                    />
                    <div className="mt-4">
                      <PieChart
                        data={chartData.revenueByPaymentMethod}
                        colors={[
                          "#3B82F6",
                          "#F97316",
                          "#10B981",
                          "#EF4444",
                          "#8B5CF6",
                        ]}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-neutral-500">No data available</p>
                )}
              </Panel>

              <Panel title="Revenue by Payment Status">
                {chartData?.revenueByPaymentStatus?.length > 0 ? (
                  <>
                    <BarList
                      data={chartData.revenueByPaymentStatus}
                      total={totalRevenue}
                      color="bg-accent-500"
                    />
                    <div className="mt-4">
                      <ColumnChart
                        data={chartData.revenueByPaymentStatus}
                        color="#F97316"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-neutral-500">No data available</p>
                )}
              </Panel>

              <Panel title="Revenue by Booking Status">
                {chartData?.revenueByOrderStatus?.length > 0 ? (
                  <>
                    <BarList
                      data={chartData.revenueByOrderStatus}
                      total={totalRevenue}
                      color="bg-primary-600"
                    />
                    <div className="mt-4">
                      <PieChart
                        data={chartData.revenueByOrderStatus}
                        colors={["#10B981", "#3B82F6", "#EF4444", "#F59E0B"]}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-neutral-500">No data available</p>
                )}
              </Panel>

              <Panel title="Rentals by Payment Method">
                {chartData?.bookingsByPaymentMethod?.length > 0 ? (
                  <BarList
                    data={chartData.bookingsByPaymentMethod}
                    total={data.totalBookings || 0}
                    color="bg-accent-600"
                    showCount
                  />
                ) : (
                  <p className="text-sm text-neutral-500">No data available</p>
                )}
              </Panel>
            </div>
          </Section>

          {/* Time Series Charts */}
          <Section title="Time Series Analysis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel title="Revenue Trend (Daily)">
                {chartData?.revenueByDate?.length > 0 ? (
                  <LineChart
                    data={chartData.revenueByDate.map((d) => ({
                      label: d.date,
                      value: d.revenue || 0,
                    }))}
                    color="#3B82F6"
                  />
                ) : (
                  <p className="text-sm text-neutral-500">No data available</p>
                )}
              </Panel>

              <Panel title="Revenue Trend (Monthly)">
                {chartData?.revenueByMonth?.length > 0 ? (
                  <AreaChart
                    data={chartData.revenueByMonth.map((d) => ({
                      label: d.date,
                      value: d.revenue || 0,
                    }))}
                    color="#F97316"
                  />
                ) : (
                  <p className="text-sm text-neutral-500">No data available</p>
                )}
              </Panel>
            </div>
          </Section>

          {/* Top Cars */}
          <Section title="Top Cars by Revenue">
            <Panel title="Top 10 Cars">
              {chartData?.topCars?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-primary-50 text-neutral-700 border-b border-primary-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Car Code
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Car Name
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Revenue
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Rentals
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Avg Order Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.topCars.map((car, idx) => (
                        <tr
                          key={car.tourDetailID}
                          className="border-b border-neutral-100 hover:bg-primary-50/30 transition"
                        >
                          <td className="px-4 py-3 font-semibold text-neutral-900">
                            #{idx + 1}
                          </td>
                          <td className="px-4 py-3 text-neutral-700">
                            {car.tourCode || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-neutral-700">
                            {car.tourName || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-primary-600">
                            {formatUSD(car.revenue || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-neutral-700">
                            {car.bookingCount || 0}
                          </td>
                          <td className="px-4 py-3 text-right text-neutral-700">
                            {car.averageOrderValue
                              ? formatUSD(car.averageOrderValue)
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No data available</p>
              )}
            </Panel>
          </Section>
        </>
      )}
    </div>
  );
}

// Reusable components (same as PackageSalesAnalysis)
function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <p className="text-xs text-neutral-600 font-medium">{label}</p>
      <p
        className={`text-2xl font-bold mt-2 ${
          accent ? "text-primary-600" : "text-neutral-900"
        }`}
      >
        {typeof value === "number"
          ? label.includes("Revenue")
            ? formatUSD(value)
            : value.toLocaleString()
          : value}
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-neutral-900 border-b border-primary-200 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <h3 className="font-semibold text-neutral-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function BarList({ data, total, color, showCount = false }) {
  return (
    <div className="space-y-2">
      {data.map((d) => {
        const pct =
          total && total > 0
            ? Math.min(100, Math.round((d.value / total) * 100))
            : 0;
        return (
          <div key={d.label}>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{d.label}</span>
              <span className="text-gray-600">
                {showCount
                  ? d.value.toLocaleString()
                  : formatUSD(d.value)}
              </span>
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
  const sum = data.reduce((acc, d) => acc + d.value, 0);
  if (sum === 0) return <p className="text-xs text-gray-500">No data</p>;

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
            <span
              className="w-3 h-3 rounded"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="font-semibold">{d.label}</span>
            <span className="text-gray-600">
              {formatUSD(d.value)}
            </span>
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
              style={{
                height: `${pct}%`,
                background: color,
                minHeight: "18px",
              }}
              title={`${d.label}: ${formatUSD(d.value)}`}
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
  const path =
    points.length > 0
      ? `M ${points[0]} L ${points.slice(1).join(" ")} L 100,100 L 0,100 Z`
      : "";
  return (
    <div className="h-36 w-full bg-gray-50 border rounded-lg p-3">
      {points.length > 0 ? (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d={path} fill={color + "33"} stroke={color} strokeWidth="1.5" />
        </svg>
      ) : (
        <p className="text-xs text-gray-500">No data</p>
      )}
      <div className="flex justify-between text-[11px] text-gray-500 mt-1">
        {data.map((d) => (
          <span key={d.label} className="truncate">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data, color }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * 100;
    const y = 100 - (d.value / max) * 100;
    return `${x},${y}`;
  });
  const path =
    points.length > 1 ? `M ${points[0]} L ${points.slice(1).join(" ")}` : "";
  return (
    <div className="h-48 w-full bg-gray-50 border rounded-lg p-3">
      {points.length > 0 ? (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => {
            const [x, y] = p.split(",").map(Number);
            return <circle key={i} cx={x} cy={y} r="1.5" fill={color} />;
          })}
        </svg>
      ) : (
        <p className="text-xs text-gray-500">No data</p>
      )}
      <div className="flex justify-between text-[11px] text-gray-500 mt-1">
        {data.map((d) => (
          <span key={d.label} className="truncate">
            {d.label.split("-")[2] || d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

