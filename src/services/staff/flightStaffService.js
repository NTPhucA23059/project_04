import api from "../api";

const BASE = "/staff/flights";

export const searchFlights = async ({
  page = 0,
  size = 10,
  keyword,
  status,
  fromCityID,
  toCityID,
}) => {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  if (status !== undefined && status !== null && status !== "") {
    params.status = status;
  }
  if (fromCityID) params.fromCityID = fromCityID;
  if (toCityID) params.toCityID = toCityID;

  const res = await api.get(BASE, { params });
  return res.data;
};

export const createFlight = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

export const updateFlight = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteFlight = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

export const getFlightById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};


