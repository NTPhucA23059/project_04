import React, { useState, useEffect } from "react";
import {
  PresentationChartLineIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  UserGroupIcon,
  TruckIcon,
  MapIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { getStaffDashboardStats } from "../../../services/staff/dashboardStaffService";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    tourRevenue: 0,
    carRevenue: 0,
    totalBookings: 0,
    tourBookings: 0,
    carBookings: 0,
    revenueGrowth: 0,
    tourRevenueGrowth: 0,
    carRevenueGrowth: 0,
    bookingGrowth: 0,
    tourBookingGrowth: 0,
    carBookingGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await getStaffDashboardStats();

      setStats({
        totalRevenue: dashboardData.totalRevenue ? Number(dashboardData.totalRevenue) : 0,
        tourRevenue: dashboardData.tourRevenue ? Number(dashboardData.tourRevenue) : 0,
        carRevenue: dashboardData.carRevenue ? Number(dashboardData.carRevenue) : 0,
        totalBookings: dashboardData.totalBookings || 0,
        tourBookings: dashboardData.tourBookings || 0,
        carBookings: dashboardData.carBookings || 0,
        revenueGrowth: dashboardData.revenueGrowth || 0,
        tourRevenueGrowth: dashboardData.tourRevenueGrowth || 0,
        carRevenueGrowth: dashboardData.carRevenueGrowth || 0,
        bookingGrowth: dashboardData.bookingGrowth || 0,
        tourBookingGrowth: dashboardData.tourBookingGrowth || 0,
        carBookingGrowth: dashboardData.carBookingGrowth || 0,
      });
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    // Convert from VND to USD (assuming backend returns VND)
    // 1 USD = 24,000 VND
    const usdAmount = amount / 24000;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(usdAmount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const StatCard = ({ icon: Icon, label, value, change, color, bgColor }) => {
    return (
      <div
        className={`bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all ${bgColor || ""}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color || "text-gray-900"}`}>
              {typeof value === "number"
                ? label.includes("Revenue") || label.includes("Doanh thu")
                  ? formatCurrency(value)
                  : formatNumber(value)
                : value}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-2 text-xs">
                {change > 0 ? (
                  <>
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">
                      +{change.toFixed(1)}%
                    </span>
                  </>
                ) : change < 0 ? (
                  <>
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-600 font-medium">
                      {change.toFixed(1)}%
                    </span>
                  </>
                ) : null}
                {change !== 0 && (
                  <span className="text-gray-500 ml-1">vs last month</span>
                )}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color || "bg-blue-100"} bg-opacity-10`}>
            <Icon className={`h-7 w-7 ${color || "text-blue-600"}`} />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
            <p className="text-primary-50 text-sm">
              Revenue and booking overview
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-50">Today</p>
            <p className="text-2xl font-bold">
              {new Date().toLocaleDateString("en-US", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={BanknotesIcon}
          label="Total Revenue"
          value={stats.totalRevenue}
          change={stats.revenueGrowth}
          color="text-primary-600"
        />
        <StatCard
          icon={MapIcon}
          label="Tour Revenue"
          value={stats.tourRevenue}
          change={stats.tourRevenueGrowth}
          color="text-blue-600"
        />
        <StatCard
          icon={TruckIcon}
          label="Car Rental Revenue"
          value={stats.carRevenue}
          change={stats.carRevenueGrowth}
          color="text-green-600"
        />
        <StatCard
          icon={ClipboardDocumentCheckIcon}
          label="Total Bookings"
          value={stats.totalBookings}
          change={stats.bookingGrowth}
          color="text-purple-600"
        />
        <StatCard
          icon={MapIcon}
          label="Tour Bookings"
          value={stats.tourBookings}
          change={stats.tourBookingGrowth}
          color="text-indigo-600"
        />
        <StatCard
          icon={TruckIcon}
          label="Car Bookings"
          value={stats.carBookings}
          change={stats.carBookingGrowth}
          color="text-orange-600"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tour Revenue */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-200 rounded-lg">
                  <MapIcon className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tour Packages</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(stats.tourRevenue)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700">Percentage</span>
                <span className="font-semibold text-blue-700">
                  {stats.totalRevenue > 0
                    ? `${Math.round((stats.tourRevenue / stats.totalRevenue) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.totalRevenue > 0
                        ? Math.round((stats.tourRevenue / stats.totalRevenue) * 100)
                        : 0
                      }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              {stats.tourRevenueGrowth > 0 ? (
                <>
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    +{stats.tourRevenueGrowth.toFixed(1)}%
                  </span>
                </>
              ) : stats.tourRevenueGrowth < 0 ? (
                <>
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">
                    {stats.tourRevenueGrowth.toFixed(1)}%
                  </span>
                </>
              ) : null}
              {stats.tourRevenueGrowth !== 0 && (
                <span className="text-gray-500">vs last month</span>
              )}
            </div>
          </div>

          {/* Car Rental Revenue */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-200 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Car Rentals</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(stats.carRevenue)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700">Percentage</span>
                <span className="font-semibold text-green-700">
                  {stats.totalRevenue > 0
                    ? `${Math.round((stats.carRevenue / stats.totalRevenue) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.totalRevenue > 0
                        ? Math.round((stats.carRevenue / stats.totalRevenue) * 100)
                        : 0
                      }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              {stats.carRevenueGrowth > 0 ? (
                <>
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    +{stats.carRevenueGrowth.toFixed(1)}%
                  </span>
                </>
              ) : stats.carRevenueGrowth < 0 ? (
                <>
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">
                    {stats.carRevenueGrowth.toFixed(1)}%
                  </span>
                </>
              ) : null}
              {stats.carRevenueGrowth !== 0 && (
                <span className="text-gray-500">vs last month</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <ClipboardDocumentCheckIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-1">Total Bookings</p>
          <p className="text-xl font-bold text-gray-900">
            {formatNumber(stats.totalBookings)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <MapIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-1">Tour Bookings</p>
          <p className="text-xl font-bold text-gray-900">
            {formatNumber(stats.tourBookings)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <TruckIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-1">Car Bookings</p>
          <p className="text-xl font-bold text-gray-900">
            {formatNumber(stats.carBookings)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <BanknotesIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
}
