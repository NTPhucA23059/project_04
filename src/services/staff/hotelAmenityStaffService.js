import api from "../api";

const BASE = "/staff/hotel-amenities";

export const searchHotelAmenities = async ({
  page = 0,
  size = 10,
  keyword,
  hotelID,
  category,
}) => {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  if (hotelID) params.hotelID = hotelID;
  if (category) params.category = category;

  const res = await api.get(BASE, { params });
  return res.data;
};

export const getHotelAmenityById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createHotelAmenity = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

export const updateHotelAmenity = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteHotelAmenity = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};




