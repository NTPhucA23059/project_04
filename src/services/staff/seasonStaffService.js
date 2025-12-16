import api from "../api";

const BASE = "/staff/seasons";

export const getAllSeasons = async () => {
  const res = await api.get(`${BASE}/all`);
  return res.data;
};

/**
 * Search + paging
 */
export const searchSeasons = async ({
  page = 0,
  size = 10,
  keyword,
  status,
  month,
}) => {
  const params = { page, size };

  if (keyword) params.keyword = keyword;
  if (status !== undefined) params.status = status;
  if (month !== undefined) params.month = month;

  const res = await api.get(BASE, { params });
  return res.data;
};

/**
 * Create new season
 */
export const createSeason = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

/**
 * Update season
 */
export const updateSeason = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

/**
 * Delete season
 */
export const deleteSeason = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};








