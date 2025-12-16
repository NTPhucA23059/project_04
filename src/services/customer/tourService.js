import api from "../api";

const BASE = "/customer/tours";
const CATEGORY_BASE = "/customer/tour-categories";

// GET list tours (paging + search + category)
export const fetchTours = async ({ page = 0, size = 10, keyword, categoryId }) => {
  const params = { page, size };

  if (keyword) params.keyword = keyword;
  if (categoryId) params.categoryId = categoryId;

  const res = await api.get(BASE, { params });
  return res.data;
};

// GET 1 tour detail
export const fetchTourById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const fetchTourCategories = async () => {
  const res = await api.get(`${CATEGORY_BASE}/all`);
  return res.data;
};







