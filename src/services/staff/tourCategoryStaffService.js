import api from "../api";

const BASE = "/staff/tour-categories";

export const searchTourCategories = async ({
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
  if (status) params.status = status;

  const res = await api.get(BASE, { params });
  return res.data;
};

export const createTourCategory = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

export const updateTourCategory = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteTourCategory = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};







