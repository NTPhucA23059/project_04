import api from "../api";

const BASE = "/staff/tour-cities";

export const getTourCities = async (tourID) => {
  const res = await api.get(`${BASE}/tour/${tourID}`);
  return res.data.items || [];
};

export const createTourCity = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

export const updateTourCity = async (tourID, cityID, payload) => {
  const res = await api.put(`${BASE}/${tourID}/${cityID}`, payload);
  return res.data;
};

export const deleteTourCity = async (tourID, cityID) => {
  const res = await api.delete(`${BASE}/${tourID}/${cityID}`);
  return res.data;
};

