import api from "../api";

const BASE = "/customer/cars";

// 🔍 Search + filter + paging (Customer)
export const fetchCars = async ({ page = 0, size = 10, keyword, carTypeID }) => {
  const params = { page, size };

  if (keyword) params.keyword = keyword;
  if (carTypeID) params.carTypeID = carTypeID;

  const res = await api.get(BASE, { params });
  return res.data;
};

// 🔍 Get car detail (Customer)
export const fetchCarById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};







