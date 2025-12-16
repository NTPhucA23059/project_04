import api from "../api";

const BASE = "/customer/cities";

// 🔍 Search + filter + paging (Customer)
export const fetchCities = async ({ page = 0, size = 10, keyword }) => {
  const params = { page, size };

  if (keyword) params.keyword = keyword;

  const res = await api.get(BASE, { params });
  return res.data;
};

// 🔍 Get city detail (Customer)
export const fetchCityById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

// 🔍 Get all cities (for dropdowns/filters)
export const getAllCities = async () => {
  const res = await api.get(BASE, { params: { page: 0, size: 1000 } });
  return res.data.items || [];
};



