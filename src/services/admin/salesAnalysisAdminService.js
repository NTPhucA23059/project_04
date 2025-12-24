// src/services/admin/salesAnalysisAdminService.js
import { apiFetch } from "./client";

const BASE = "/admin/sales-analysis";

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
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (tourDetailID) params.append("tourDetailID", tourDetailID);

  const queryString = params.toString();
  const url = queryString ? `${BASE}/package-sales?${queryString}` : `${BASE}/package-sales`;
  
  return await apiFetch(url);
};

/**
 * Analyze car rental sales
 * @param {Object} params - Analysis parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {number} params.carID - Optional car ID filter
 */
export const analyzeCarRentalSales = async ({
  startDate,
  endDate,
  carID,
} = {}) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (carID) params.append("carID", carID);

  const queryString = params.toString();
  const url = queryString ? `${BASE}/car-rental-sales?${queryString}` : `${BASE}/car-rental-sales`;
  
  return await apiFetch(url);
};








