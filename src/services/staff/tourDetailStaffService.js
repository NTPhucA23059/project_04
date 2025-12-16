import api from "../api";

const BASE = "/staff/tour-details";

export const getTourDetails = async (tourID) => {
  const res = await api.get(`${BASE}/tour/${tourID}`);
  return res.data.items || [];
};

export const createTourDetail = async (tourID, payload) => {
  const res = await api.post(`${BASE}/tour/${tourID}`, payload);
  return res.data;
};

export const updateTourDetail = async (tourDetailID, payload) => {
  const res = await api.put(`${BASE}/${tourDetailID}`, payload);
  return res.data;
};

export const deleteTourDetail = async (tourDetailID) => {
  const res = await api.delete(`${BASE}/${tourDetailID}`);
  return res.data;
};

export const getTourDetailById = async (tourDetailID) => {
  const res = await api.get(`${BASE}/${tourDetailID}`);
  return res.data;
};



