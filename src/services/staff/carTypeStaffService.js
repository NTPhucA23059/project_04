import api from "../api";

const BASE = "/staff/car-types";

/**
 * Search + paging
 */
export const searchCarTypes = async ({ page = 0, size = 10, keyword, status }) => {
  const params = { page, size };

  if (keyword) params.keyword = keyword;
  if (status !== undefined) params.status = status;

  const res = await api.get(BASE, { params });
  return res.data;
};

/**
 * Create new car type
 */
export const createCarType = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

/**
 * Update car type
 */
export const updateCarType = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

/**
 * Delete car type
 */
export const deleteCarType = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};





