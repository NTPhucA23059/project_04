import React, { useState, useEffect } from "react";
import {
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TruckIcon,
  MapIcon,
  BuildingOfficeIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { apiFetch } from "../../../services/admin/client";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    tourBookings: 0,
    carBookings: 0,
    pendingRefunds: 0,
    totalTours: 0,
    totalCars: 0,
    totalHotels: 0,
    totalFlights: 0,
    tourRevenue: 0,
    carRevenue: 0,
    userGrowth: 0,
    bookingGrowth: 0,
    revenueGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load dashboard stats from API
      const dashboardData = await apiFetch("/admin/dashboard/stats");
      
      setStats({
        totalUsers: dashboardData.totalUsers || 0,
        activeUsers: dashboardData.activeUsers || 0,
        totalBookings: dashboardData.totalBookings || 0,
        totalRevenue: dashboardData.totalRevenue ? Number(dashboardData.totalRevenue) : 0,
        tourBookings: dashboardData.tourBookings || 0,
        carBookings: dashboardData.carBookings || 0,
        pendingRefunds: dashboardData.pendingRefunds || 0,
        totalTours: dashboardData.totalTours || 0,
        totalCars: dashboardData.totalCars || 0,
        totalHotels: dashboardData.totalHotels || 0,
        totalFlights: dashboardData.totalFlights || 0,
        tourRevenue: dashboardData.tourRevenue ? Number(dashboardData.tourRevenue) : 0,
        carRevenue: dashboardData.carRevenue ? Number(dashboardData.carRevenue) : 0,
        userGrowth: dashboardData.userGrowth || 0,
        bookingGrowth: dashboardData.bookingGrowth || 0,
        revenueGrowth: dashboardData.revenueGrowth || 0,
      });

      // Recent users
      const recent = dashboardData.recentUsers || [];
      setRecentUsers(recent);

      // Recent bookings
      const bookings = dashboardData.recentBookings || [];
      setRecentBookings(bookings.map(b => ({
        id: b.id,
        type: b.type,
        customer: b.customerName,
        amount: b.amount ? Number(b.amount) : 0,
        status: b.status,
        date: b.date ? new Date(b.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      })));
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const StatCard = ({ icon: Icon, label, value, change, color, bgColor }) => {
    return (
      <div
        className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all ${bgColor || ""}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color || "text-gray-900"}`}>
              {typeof value === "number"
                ? label.includes("Revenue") || label.includes("Doanh thu")
                  ? formatCurrency(value)
                  : formatNumber(value)
                : value}
            </p>
            {change && (
              <div className="flex items-center mt-2 text-sm">
                {change > 0 ? (
                  <>
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">
                      +{change}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-600 font-medium">{change}%</span>
                  </>
                )}
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            )}
          </div>
          <div
            className={`p-4 rounded-xl ${color || "bg-blue-100"} bg-opacity-10`}
          >
            <Icon className={`h-8 w-8 ${color || "text-blue-600"}`} />
          </div>
        </div>
      </div>
    );
  };

  const QuickStatCard = ({ icon: Icon, label, value, color }) => {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-600">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-blue-100 text-sm">
              System overview and statistics
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Today</p>
            <p className="text-2xl font-bold">
              {new Date().toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={UserGroupIcon}
          label="Total Users"
          value={stats.totalUsers}
          change={stats.userGrowth}
          color="text-blue-600"
        />
        <StatCard
          icon={ClipboardDocumentCheckIcon}
          label="Total Bookings"
          value={stats.totalBookings}
          change={stats.bookingGrowth}
          color="text-green-600"
        />
        <StatCard
          icon={BanknotesIcon}
          label="Total Revenue"
          value={stats.totalRevenue}
          change={stats.revenueGrowth}
          color="text-purple-600"
        />
        <StatCard
          icon={UserGroupIcon}
          label="Active Users"
          value={stats.activeUsers}
          color="text-indigo-600"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        <QuickStatCard
          icon={MapIcon}
          label="Tours"
          value={stats.totalTours}
          color="text-blue-600"
        />
        <QuickStatCard
          icon={TruckIcon}
          label="Cars"
          value={stats.totalCars}
          color="text-green-600"
        />
        <QuickStatCard
          icon={BuildingOfficeIcon}
          label="Hotels"
          value={stats.totalHotels}
          color="text-purple-600"
        />
        <QuickStatCard
          icon={PaperAirplaneIcon}
          label="Flights"
          value={stats.totalFlights}
          color="text-orange-600"
        />
        <QuickStatCard
          icon={ClipboardDocumentCheckIcon}
          label="Tour Bookings"
          value={stats.tourBookings}
          color="text-indigo-600"
        />
        <QuickStatCard
          icon={TruckIcon}
          label="Car Bookings"
          value={stats.carBookings}
          color="text-pink-600"
        />
      </div>

      {/* Revenue & Recent Data - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview - Compact */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue</h2>
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-1">Tour</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(stats.tourRevenue || 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <TruckIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-1">Car Rental</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(stats.carRevenue || 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <BanknotesIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-1">Total</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Users - Compact */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentUsers.length > 0 ? (
              recentUsers.map((user, idx) => (
                <div
                  key={user.accountID || idx}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-xs">
                      {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {user.fullName || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      user.status === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status === 1 ? "✓" : "✗"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4 text-sm">No data available</p>
            )}
          </div>
        </div>

        {/* Recent Bookings - Compact */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        booking.type === "Tour"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {booking.type === "Tour" ? "Tour" : "Xe"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        booking.status === "Confirmed" || booking.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {booking.customer}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{booking.date}</p>
                    <p className="font-bold text-sm text-gray-900">
                      {formatCurrency(booking.amount)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4 text-sm">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
