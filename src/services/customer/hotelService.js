import api from "../api";

const BASE = "/customer/hotels";

// 🔍 Search + filter + paging (Customer)
export const fetchHotels = async ({ page = 0, size = 10, keyword, cityID }) => {
  const params = { page, size };

  if (keyword) params.keyword = keyword;
  if (cityID) params.cityID = cityID;

  const res = await api.get(BASE, { params });
  return res.data;
};

// 🔍 Get hotel detail (Customer)
export const fetchHotelById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

// 🔍 Get all hotels (for dropdowns/filters)
export const getAllHotels = async () => {
  const res = await api.get(BASE, { params: { page: 0, size: 1000 } });
  return res.data.items || [];
};

// 🔍 Get hotels by city
export const getHotelsByCity = async (cityID) => {
  const res = await api.get(BASE, { params: { page: 0, size: 1000, cityID } });
  return res.data.items || [];
};

