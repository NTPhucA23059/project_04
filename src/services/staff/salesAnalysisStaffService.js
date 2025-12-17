// src/services/staff/salesAnalysisStaffService.js
import api from "../api";

const BASE = "/staff/sales-analysis";

/**
 * Analyze package service sales
 * @param {Object} params - Analysis parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {number} params.tourDetailID - Optional tour detail ID filter
 */
export const analyzePackageSales = async ({
  startDate,
  endDate,
  tourDetailID,
} = {}) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (tourDetailID) params.tourDetailID = tourDetailID;

  const res = await api.get(`${BASE}/package-sales`, { params });
  return res.data;
};
