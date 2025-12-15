import api from "../api";

const BASE = "/customer/flights";

// 🔍 Search + filter + paging (Customer)
export const fetchFlights = async ({ page = 0, size = 10, keyword, fromCityID, toCityID }) => {
  const params = { page, size };

  if (keyword) params.keyword = keyword;
  if (fromCityID) params.fromCityID = fromCityID;
  if (toCityID) params.toCityID = toCityID;

  const res = await api.get(BASE, { params });
  return res.data;
};

// 🔍 Get flight detail (Customer)
export const fetchFlightById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

// 🔍 Search flights (legacy function name for compatibility)
export const searchFlights = async ({ page = 0, size = 10, keyword, fromCityID, toCityID }) => {
  const params = { page, size };

  if (keyword) params.keyword = keyword;
  if (fromCityID) params.fromCityID = fromCityID;
  if (toCityID) params.toCityID = toCityID;
  // Note: status is filtered automatically by backend (only active flights)

  const res = await api.get(BASE, { params });
  return res.data.items || [];
};

// 🔍 Get flight by ID (legacy function name for compatibility)
export const getFlightById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

