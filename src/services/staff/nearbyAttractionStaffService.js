import api from "../api";

const BASE = "/staff/nearby-attractions";

export const searchNearbyAttractions = async ({
  page = 0,
  size = 10,
  keyword,
  hotelID,
  attractionType,
}) => {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  if (hotelID) params.hotelID = hotelID;
  if (attractionType) params.attractionType = attractionType;

  const res = await api.get(BASE, { params });
  return res.data;
};

export const getNearbyAttractionById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createNearbyAttraction = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

export const updateNearbyAttraction = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteNearbyAttraction = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

