import api from "../api";

const BASE = "/staff/cities";

export const searchCities = async ({
  page = 0,
  size = 10,
  keyword,
  status,
}) => {
  const params = {
    page,
    size,
  };
  if (keyword) params.keyword = keyword;
  if (status !== undefined && status !== null) params.status = status;

  const res = await api.get(BASE, { params });
  return res.data;
};

export const createCity = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

export const updateCity = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteCity = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

export const getCityById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const getAllCities = async () => {
  const res = await api.get(BASE, { 
    params: { 
      page: 0, 
      size: 1000 
    } 
  });
  return res.data.items || [];
};



