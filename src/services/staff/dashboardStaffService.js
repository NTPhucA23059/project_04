// src/services/staff/dashboardStaffService.js
import api from "../api";

const BASE = "/staff/dashboard";

/**
 * Get staff dashboard statistics
 */
export const getStaffDashboardStats = async () => {
  const res = await api.get(`${BASE}/stats`);
  return res.data;
};








